// ==========================================================================
// Recomendación de mercados (Sección 9).
// Regla de oro: si el ganador directo es riesgoso, ofrecer alternativas más
// conservadoras (doble oportunidad, DNB, líneas de goles) en lugar de callar.
// ==========================================================================
import type { MarketRecommendation, Outcome, RiskLevel } from "../types";
import { round } from "./math";

interface MarketsInput {
  probabilities: Record<Outcome, number>;
  pick: Outcome;
  expectedGoals: number;
  riskLevel: RiskLevel;
  homeName: string;
  awayName: string;
  /** Probabilidad de que ambos equipos anoten (0..1). */
  bttsProbability: number;
}

export function recommendMarkets(input: MarketsInput): MarketRecommendation[] {
  const { probabilities, pick, expectedGoals, riskLevel, homeName, awayName, bttsProbability } =
    input;
  const recs: MarketRecommendation[] = [];

  const favName = pick === "home" ? homeName : pick === "away" ? awayName : "el favorito";
  const pFav = probabilities[pick];

  // Doble oportunidad para el favorito (favorito o empate): muy conservador.
  if (pick !== "draw") {
    const dc = round(probabilities[pick] + probabilities.draw, 3);
    recs.push({
      market: `Doble oportunidad (${favName} o empate)`,
      tag: "conservador",
      probability: dc,
      rationale:
        "Cubre victoria o empate del favorito. Reduce el riesgo cuando el partido no es una goleada anunciada.",
    });
  }

  // Ganador directo: solo se destaca si la probabilidad es alta y el riesgo no es extremo.
  if (pFav >= 0.55 && riskLevel !== "EXTREMO") {
    recs.push({
      market: `Ganador: ${favName}`,
      tag: pFav >= 0.65 ? "moderado" : "agresivo",
      probability: round(pFav, 3),
      rationale:
        "El favorito tiene ventaja clara según el modelo. Pago mayor que la doble oportunidad, con más riesgo.",
    });
  }

  // Empate no acción (DNB): conservador, devuelve la apuesta si hay empate.
  if (pick !== "draw" && pFav >= 0.45) {
    const dnb = round(pFav / (1 - probabilities.draw), 3);
    recs.push({
      market: `${favName} — empate no acción (DNB)`,
      tag: "conservador",
      probability: dnb,
      rationale: "Si el partido termina en empate, se devuelve la apuesta. Buen colchón ante partidos cerrados.",
    });
  }

  // Líneas de goles según goles esperados.
  if (expectedGoals >= 2.6) {
    recs.push({
      market: "Más de 1.5 goles",
      tag: "conservador",
      probability: round(Math.min(0.9, 0.55 + (expectedGoals - 2.6) * 0.12), 3),
      rationale: "Se esperan varios goles; superar 1.5 suele ser una línea segura en partidos ofensivos.",
    });
    recs.push({
      market: "Más de 2.5 goles",
      tag: "agresivo",
      probability: round(Math.min(0.75, 0.45 + (expectedGoals - 2.6) * 0.15), 3),
      rationale: "Alternativa de mayor pago si ambos ataques rinden. Riesgo mayor que la línea de 1.5.",
    });
  } else {
    recs.push({
      market: "Menos de 3.5 goles",
      tag: "conservador",
      probability: round(Math.min(0.9, 0.72 + (2.6 - expectedGoals) * 0.1), 3),
      rationale: "Partido con pocos goles esperados; la línea baja de goles es más probable.",
    });
  }

  // Ambos equipos anotan.
  if (bttsProbability >= 0.5) {
    recs.push({
      market: "Ambos equipos anotan (BTTS)",
      tag: "moderado",
      probability: round(bttsProbability, 3),
      rationale: "Ambas defensas son vulnerables y ambos ataques generan; escenario típico de BTTS.",
    });
  }

  // Ordenar por tag (conservador primero) y luego por probabilidad.
  const tagOrder = { conservador: 0, moderado: 1, agresivo: 2 };
  return recs.sort(
    (a, b) => tagOrder[a.tag] - tagOrder[b.tag] || b.probability - a.probability
  );
}
