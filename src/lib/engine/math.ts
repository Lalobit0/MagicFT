// ==========================================================================
// Utilidades numéricas puras del motor.
// ==========================================================================

/** Limita un valor al rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Escala un valor de [inMin, inMax] a [0, 100], topando en los extremos. */
export function normalize100(value: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return 50;
  return clamp(((value - inMin) / (inMax - inMin)) * 100, 0, 100);
}

/** Función logística estándar. */
export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Redondea a n decimales. */
export function round(value: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

/**
 * Convierte momios decimales 1X2 a probabilidades implícitas SIN vig
 * (se normaliza para que sumen 1, removiendo el margen de la casa).
 */
export function impliedProbsNoVig(
  homeOdds: number,
  drawOdds: number,
  awayOdds: number
): { home: number; draw: number; away: number } {
  const rawHome = 1 / homeOdds;
  const rawDraw = 1 / drawOdds;
  const rawAway = 1 / awayOdds;
  const overround = rawHome + rawDraw + rawAway;
  return {
    home: rawHome / overround,
    draw: rawDraw / overround,
    away: rawAway / overround,
  };
}

/** Convierte una probabilidad (0..1) a momio decimal justo (sin margen). */
export function probToFairOdds(p: number): number {
  if (p <= 0) return Infinity;
  return round(1 / p, 2);
}
