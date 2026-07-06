// ==========================================================================
// Detección de valor: compara la probabilidad del modelo contra el momio.
// ==========================================================================
import type { Odds1x2, Outcome, ValueSignal } from "../types";
import { VALUE } from "./config";
import { impliedProbsNoVig, round } from "./math";

/**
 * Para cada resultado (1X2) calcula la ventaja (edge) y el valor esperado (EV).
 * EV por unidad apostada = p_modelo * momio - 1.
 * Un EV > 0 indica que, si el modelo tiene razón, la apuesta paga por encima
 * de su probabilidad real: eso es una "apuesta de valor".
 */
export function detectValue(
  modelProbs: Record<Outcome, number>,
  odds?: Odds1x2
): ValueSignal[] {
  if (!odds) return [];

  const market = impliedProbsNoVig(odds.home, odds.draw, odds.away);
  const rows: { outcome: Outcome; odd: number; marketP: number }[] = [
    { outcome: "home", odd: odds.home, marketP: market.home },
    { outcome: "draw", odd: odds.draw, marketP: market.draw },
    { outcome: "away", odd: odds.away, marketP: market.away },
  ];

  return rows.map(({ outcome, odd, marketP }) => {
    const modelP = modelProbs[outcome];
    const edge = modelP - marketP;
    const ev = modelP * odd - 1;
    const isValue =
      edge >= VALUE.minEdge && modelP >= VALUE.minModelProb && ev > 0;
    return {
      outcome,
      modelProbability: round(modelP, 3),
      marketProbability: round(marketP, 3),
      edge: round(edge, 3),
      expectedValue: round(ev, 3),
      isValue,
    };
  });
}
