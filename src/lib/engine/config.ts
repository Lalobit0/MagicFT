// ==========================================================================
// Constantes y ponderaciones del motor v1 (reglas). Todo es ajustable aquí:
// este archivo es el "panel de control" del modelo estadístico.
// Documentado en docs/03-motor-predictivo.md
// ==========================================================================

/**
 * Pesos de los factores que forman el "índice de poder" base de cada equipo.
 * Deben sumar 1. Cambiarlos re-calibra el modelo sin tocar la lógica.
 */
export const BASE_WEIGHTS = {
  form: 0.26, // forma reciente (últimos 5)
  attack: 0.2, // rendimiento ofensivo
  defense: 0.2, // rendimiento defensivo
  table: 0.18, // posición en la tabla
  h2h: 0.16, // historial directo
} as const;

/** Ajustes aditivos al "power" (en puntos de índice, no en %). */
export const ADJUSTMENTS = {
  /** Ventaja de localía en puntos de power. */
  homeAdvantage: 8,
  /** Puntos por cada día de diferencia de descanso (topado a ±3 días). */
  restPerDay: 1.5,
  /** Penalización de power por unidad de impacto de bajas clave. */
  injuryPenalty: 5,
  /** Puntos de power por unidad de sentimiento de noticias (-1..1). */
  newsWeight: 4,
} as const;

/** Curva logística: convierte diferencia de power a probabilidad. */
export const LOGISTIC_K = 0.05;

/** Modelo de empate (fútbol). */
export const DRAW = {
  /** Probabilidad base de empate cuando los equipos son iguales. */
  base: 0.28,
  /** Escala de decaimiento: a mayor diferencia de power, menos empates. */
  scale: 40,
  /** Piso mínimo de probabilidad de empate. */
  floor: 0.12,
} as const;

/** Mezcla modelo↔mercado: 0 = solo modelo, 1 = solo momios. */
export const MARKET_BLEND_LAMBDA = 0.4;

/** Umbrales para detección de valor. */
export const VALUE = {
  /** Ventaja mínima (prob modelo - prob mercado) para marcar valor. */
  minEdge: 0.05,
  /** Probabilidad mínima del modelo para considerar el pick apostable. */
  minModelProb: 0.35,
} as const;

/** Bandas de confianza (Sección 7). Se leen de mayor a menor. */
export const CONFIDENCE_BANDS: { level: import("../types").ConfidenceLevel; min: number }[] = [
  { level: "ALTA", min: 75 },
  { level: "MEDIA_ALTA", min: 62 },
  { level: "MEDIA", min: 50 },
  { level: "BAJA", min: 40 },
  { level: "NO_RECOMENDABLE", min: 0 },
];

/** Bandas de riesgo (Sección 8). Se leen de mayor a menor. */
export const RISK_BANDS: { level: import("../types").RiskLevel; min: number }[] = [
  { level: "EXTREMO", min: 72 },
  { level: "ALTO", min: 52 },
  { level: "MODERADO", min: 30 },
  { level: "BAJO", min: 0 },
];

/** Advertencia responsable obligatoria (Sección 13). */
export const RESPONSIBLE_DISCLAIMER =
  "Este análisis es informativo y probabilístico. No garantiza resultados. " +
  "Apostar implica riesgo de pérdida económica. Juega con responsabilidad. +18.";
