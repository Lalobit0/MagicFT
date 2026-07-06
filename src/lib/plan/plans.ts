// ==========================================================================
// Definición de planes de suscripción y qué desbloquea cada uno.
// Fuente de verdad para límites y features (Sección 12).
// ==========================================================================

export type PlanId = "free" | "premium" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  priceMxn: number;
  period: string;
  /** Análisis distintos por día. null = ilimitado. */
  dailyAnalysisLimit: number | null;
  features: {
    /** Ver comparación con momios y detección de valor. */
    valueAndOdds: boolean;
    /** Ranking de picks del día. */
    ranking: boolean;
    /** Historial de predicciones y % de acierto. */
    history: boolean;
    /** Alertas en tiempo real (lesiones, alineaciones, movimiento de momios). */
    realtimeAlerts: boolean;
    /** Mercados avanzados y props de jugadores. */
    advancedMarkets: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Gratis",
    priceMxn: 0,
    period: "",
    dailyAnalysisLimit: 3,
    features: {
      valueAndOdds: false,
      ranking: false,
      history: false,
      realtimeAlerts: false,
      advancedMarkets: false,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMxn: 149,
    period: "MXN / mes",
    dailyAnalysisLimit: null,
    features: {
      valueAndOdds: true,
      ranking: true,
      history: true,
      realtimeAlerts: false,
      advancedMarkets: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro / VIP",
    priceMxn: 349,
    period: "MXN / mes",
    dailyAnalysisLimit: null,
    features: {
      valueAndOdds: true,
      ranking: true,
      history: true,
      realtimeAlerts: true,
      advancedMarkets: true,
    },
  },
};

export function getPlan(id: PlanId): Plan {
  return PLANS[id] ?? PLANS.free;
}
