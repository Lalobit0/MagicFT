// ==========================================================================
// MOTOR DE PREDICCIÓN v1 (reglas + ponderaciones) para FÚTBOL.
// Flujo:
//   1. Cada equipo obtiene un "índice de poder" (0..100) a partir de sus
//      factores ponderados (forma, ataque, defensa, tabla, H2H).
//   2. Se aplican ajustes aditivos (localía, descanso, bajas, noticias).
//   3. La diferencia de poder pasa por una curva logística → prob. de local.
//   4. Se modela el empate y se reparte el resto entre local/visitante.
//   5. Si hay momios, se mezcla el modelo con el mercado (anclaje) y se
//      detecta valor comparando modelo vs. mercado.
//   6. Se clasifica confianza y riesgo, y se recomiendan mercados.
//
// Todo es determinista y explicable: cada número tiene su porqué.
// Ver docs/03-motor-predictivo.md y docs/06-formula-futbol.md
// ==========================================================================
import type {
  FactorContribution,
  MatchInput,
  Outcome,
  Prediction,
  TeamStats,
} from "../types";
import {
  ADJUSTMENTS,
  BASE_WEIGHTS,
  DRAW,
  LOGISTIC_K,
  MARKET_BLEND_LAMBDA,
  RESPONSIBLE_DISCLAIMER,
} from "./config";
import { classifyConfidence, CONFIDENCE_LABEL } from "./confidence";
import { recommendMarkets } from "./markets";
import { clamp, impliedProbsNoVig, logistic, normalize100, round } from "./math";
import { classifyRisk, RISK_LABEL } from "./risk";
import { detectValue } from "./value";

interface SubScores {
  form: number;
  attack: number;
  defense: number;
  table: number;
  h2h: number;
}

function subScores(team: TeamStats, h2hWinRate: number): SubScores {
  return {
    form: normalize100(team.formLast5Ppg, 0, 3),
    attack: normalize100(team.goalsForPerGame, 0.3, 3.0),
    // Menos goles en contra = mejor defensa.
    defense: 100 - normalize100(team.goalsAgainstPerGame, 0.3, 3.0),
    table: normalize100(team.leagueSize - team.tablePosition + 1, 1, team.leagueSize),
    h2h: clamp(h2hWinRate * 100, 0, 100),
  };
}

function basePower(s: SubScores): number {
  return (
    BASE_WEIGHTS.form * s.form +
    BASE_WEIGHTS.attack * s.attack +
    BASE_WEIGHTS.defense * s.defense +
    BASE_WEIGHTS.table * s.table +
    BASE_WEIGHTS.h2h * s.h2h
  );
}

export function predict(input: MatchInput): Prediction {
  const { home, away, context, odds } = input;

  // --- 1) Subscores e índice de poder base ---
  const homeSub = subScores(home, context.h2hHomeWinRate);
  const awaySub = subScores(away, 1 - context.h2hHomeWinRate);
  let homePower = basePower(homeSub);
  let awayPower = basePower(awaySub);

  // --- 2) Ajustes aditivos ---
  const restDiff = clamp(home.restDays - away.restDays, -3, 3);
  homePower += ADJUSTMENTS.homeAdvantage;
  homePower += ADJUSTMENTS.restPerDay * restDiff;
  homePower -= ADJUSTMENTS.injuryPenalty * home.keyInjuriesImpact;
  awayPower -= ADJUSTMENTS.injuryPenalty * away.keyInjuriesImpact;
  homePower += ADJUSTMENTS.newsWeight * home.newsSentiment;
  awayPower += ADJUSTMENTS.newsWeight * away.newsSentiment;

  const diff = homePower - awayPower;

  // --- 3) Probabilidad cruda de local (sin empate) ---
  const pHomeRaw = logistic(LOGISTIC_K * diff);

  // --- 4) Modelo de empate y reparto ---
  const pDraw = Math.max(DRAW.floor, DRAW.base * Math.exp(-Math.abs(diff) / DRAW.scale));
  const remaining = 1 - pDraw;
  const modelProbs: Record<Outcome, number> = {
    home: remaining * pHomeRaw,
    draw: pDraw,
    away: remaining * (1 - pHomeRaw),
  };

  // --- 5) Mezcla con el mercado (si hay momios) ---
  let finalProbs: Record<Outcome, number> = { ...modelProbs };
  let marketProbs: { home: number; draw: number; away: number } | undefined;
  if (odds) {
    marketProbs = impliedProbsNoVig(odds.home, odds.draw, odds.away);
    const l = MARKET_BLEND_LAMBDA;
    const blended = {
      home: (1 - l) * modelProbs.home + l * marketProbs.home,
      draw: (1 - l) * modelProbs.draw + l * marketProbs.draw,
      away: (1 - l) * modelProbs.away + l * marketProbs.away,
    };
    const sum = blended.home + blended.draw + blended.away;
    finalProbs = { home: blended.home / sum, draw: blended.draw / sum, away: blended.away / sum };
  }

  // Redondeo de presentación (manteniendo suma ~1).
  const probabilities: Record<Outcome, number> = {
    home: round(finalProbs.home, 3),
    draw: round(finalProbs.draw, 3),
    away: round(finalProbs.away, 3),
  };

  // --- Pick y probabilidad del pick ---
  const pick = (Object.entries(finalProbs) as [Outcome, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  const pickProbability = finalProbs[pick];

  // --- Goles esperados (modelo Poisson simple) y BTTS ---
  const homeExp = clamp((home.goalsForPerGame + away.goalsAgainstPerGame) / 2, 0.1, 5);
  const awayExp = clamp((away.goalsForPerGame + home.goalsAgainstPerGame) / 2, 0.1, 5);
  const expectedGoals = round(homeExp + awayExp, 2);
  const bttsProbability = (1 - Math.exp(-homeExp)) * (1 - Math.exp(-awayExp));

  // --- Completitud de datos ---
  let dataCompleteness = 1;
  if (!odds) dataCompleteness -= 0.15;
  if (context.h2hSampleSize < 3) dataCompleteness -= 0.15;
  if (home.leagueSize <= 0 || away.leagueSize <= 0) dataCompleteness -= 0.1;
  dataCompleteness = clamp(dataCompleteness, 0.4, 1);

  // --- Confianza ---
  const marketPickProbability = marketProbs ? marketProbs[pick] : undefined;
  const confidence = classifyConfidence({
    pickProbability,
    marketPickProbability,
    dataCompleteness,
  });

  // --- Riesgo ---
  const modelMarketGap =
    marketPickProbability !== undefined
      ? Math.abs(modelProbs[pick] - marketPickProbability)
      : undefined;
  const risk = classifyRisk({
    pickProbability,
    expectedGoals,
    totalKeyInjuries: home.keyInjuriesImpact + away.keyInjuriesImpact,
    dataCompleteness,
    modelMarketGap,
    minRestDays: Math.min(home.restDays, away.restDays),
    adverseWeather: Boolean(context.adverseWeather),
  });

  // --- Aporte de cada factor (para explicar en la UI, suma ≈ diff) ---
  const factors: FactorContribution[] = [
    {
      key: "form",
      label: "Forma reciente (últimos 5)",
      homeAdvantage: round(BASE_WEIGHTS.form * (homeSub.form - awaySub.form), 2),
    },
    {
      key: "attack",
      label: "Rendimiento ofensivo",
      homeAdvantage: round(BASE_WEIGHTS.attack * (homeSub.attack - awaySub.attack), 2),
    },
    {
      key: "defense",
      label: "Rendimiento defensivo",
      homeAdvantage: round(BASE_WEIGHTS.defense * (homeSub.defense - awaySub.defense), 2),
    },
    {
      key: "table",
      label: "Posición en la tabla",
      homeAdvantage: round(BASE_WEIGHTS.table * (homeSub.table - awaySub.table), 2),
    },
    {
      key: "h2h",
      label: "Historial directo",
      homeAdvantage: round(BASE_WEIGHTS.h2h * (homeSub.h2h - awaySub.h2h), 2),
    },
    { key: "home", label: "Ventaja de localía", homeAdvantage: ADJUSTMENTS.homeAdvantage },
    {
      key: "rest",
      label: "Descanso / carga de calendario",
      homeAdvantage: round(ADJUSTMENTS.restPerDay * restDiff, 2),
    },
    {
      key: "injuries",
      label: "Lesiones y bajas",
      homeAdvantage: round(
        ADJUSTMENTS.injuryPenalty * (away.keyInjuriesImpact - home.keyInjuriesImpact),
        2
      ),
    },
    {
      key: "news",
      label: "Noticias recientes",
      homeAdvantage: round(ADJUSTMENTS.newsWeight * (home.newsSentiment - away.newsSentiment), 2),
    },
  ].sort((a, b) => Math.abs(b.homeAdvantage) - Math.abs(a.homeAdvantage));

  // --- Mercados y valor ---
  const markets = recommendMarkets({
    probabilities,
    pick,
    expectedGoals,
    riskLevel: risk.level,
    homeName: home.name,
    awayName: away.name,
    bttsProbability,
  });
  const value = detectValue(modelProbs, odds);

  // --- Explicación determinista (fallback sin IA) ---
  const explanation = buildExplanation({
    input,
    pick,
    pickProbability,
    confidenceLabel: CONFIDENCE_LABEL[confidence.level],
    riskLabel: RISK_LABEL[risk.level],
    factors,
    markets,
    value,
  });

  return {
    probabilities,
    pick,
    pickProbability: round(pickProbability, 3),
    confidence,
    risk,
    expectedGoals,
    factors,
    markets,
    value,
    explanation,
    disclaimer: RESPONSIBLE_DISCLAIMER,
    dataCompleteness: round(dataCompleteness, 2),
  };
}

function outcomeName(input: MatchInput, o: Outcome): string {
  if (o === "home") return input.home.name;
  if (o === "away") return input.away.name;
  return "el empate";
}

function buildExplanation(args: {
  input: MatchInput;
  pick: Outcome;
  pickProbability: number;
  confidenceLabel: string;
  riskLabel: string;
  factors: FactorContribution[];
  markets: Prediction["markets"];
  value: Prediction["value"];
}): string {
  const { input, pick, pickProbability, confidenceLabel, riskLabel, factors, markets, value } = args;
  const pct = Math.round(pickProbability * 100);
  const favName = outcomeName(input, pick);

  // Factores que empujan hacia el lado del pick.
  const towardPick = factors
    .filter((f) => (pick === "away" ? f.homeAdvantage < 0 : f.homeAdvantage > 0))
    .slice(0, 3)
    .map((f) => f.label.toLowerCase());

  const favorablePhrase =
    towardPick.length > 0
      ? `Factores a favor: ${towardPick.join(", ")}.`
      : "Las señales están repartidas entre ambos.";

  const conservative = markets.find((m) => m.tag === "conservador");
  const valueRow = value.find((v) => v.isValue);

  const parts: string[] = [];

  if (pick === "draw") {
    parts.push(
      `El modelo ve un partido muy parejo: el empate es el resultado más probable (${pct}%).`
    );
  } else {
    parts.push(`${favName} tiene ${pct}% de probabilidad de ganar. ${confidenceLabel}.`);
  }

  parts.push(favorablePhrase);
  parts.push(`Nivel de riesgo: ${riskLabel.toLowerCase()}.`);

  if (conservative) {
    parts.push(
      `Si buscas una opción más conservadora, el mercado sugerido es "${conservative.market}".`
    );
  }
  if (valueRow) {
    parts.push(
      `Se detecta posible valor en "${outcomeName(input, valueRow.outcome)}": el modelo estima ` +
        `${Math.round(valueRow.modelProbability * 100)}% frente a ${Math.round(
          valueRow.marketProbability * 100
        )}% que implica el momio.`
    );
  }

  return parts.join(" ");
}
