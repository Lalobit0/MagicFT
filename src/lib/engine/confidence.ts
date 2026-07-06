// ==========================================================================
// Clasificación de confianza (Sección 7).
// La confianza mezcla tres señales:
//   1. Qué tan marcado es el favorito (probabilidad del pick).
//   2. Acuerdo modelo↔mercado (si coinciden, más confianza).
//   3. Completitud de los datos disponibles.
// ==========================================================================
import type { ConfidenceLevel, Outcome } from "../types";
import { CONFIDENCE_BANDS } from "./config";
import { clamp, round } from "./math";

export interface ConfidenceInput {
  pickProbability: number; // 0..1
  marketPickProbability?: number; // 0..1 (si hay momios)
  dataCompleteness: number; // 0..1
}

export function classifyConfidence(input: ConfidenceInput): {
  level: ConfidenceLevel;
  score: number;
} {
  const { pickProbability, marketPickProbability, dataCompleteness } = input;

  // Señal 1: fuerza del favorito (0.34 → 0 ; 0.75 → 100).
  const strength = clamp(((pickProbability - 0.34) / (0.75 - 0.34)) * 100, 0, 100);

  // Señal 2: acuerdo con el mercado. Sin momios, se asume acuerdo neutro (60).
  let agreement = 60;
  if (marketPickProbability !== undefined) {
    const gap = Math.abs(pickProbability - marketPickProbability); // 0..~0.4
    agreement = clamp(100 - gap * 250, 0, 100); // gap 0 → 100 ; gap 0.4 → 0
  }

  const completeness = clamp(dataCompleteness * 100, 0, 100);

  const score = round(0.5 * strength + 0.25 * agreement + 0.25 * completeness, 1);

  const level =
    CONFIDENCE_BANDS.find((b) => score >= b.min)?.level ?? "NO_RECOMENDABLE";

  return { level, score };
}

/** Etiqueta legible para la UI. */
export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  ALTA: "Confianza alta",
  MEDIA_ALTA: "Confianza media-alta",
  MEDIA: "Confianza media",
  BAJA: "Confianza baja",
  NO_RECOMENDABLE: "No recomendable",
};

/** Ayuda a decidir el pick reportado: el resultado con mayor probabilidad. */
export function argmaxOutcome(probs: Record<Outcome, number>): Outcome {
  const entries = Object.entries(probs) as [Outcome, number][];
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}
