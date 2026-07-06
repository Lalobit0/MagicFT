// ==========================================================================
// MagicFT — Tipos de dominio compartidos por el motor, la IA y la UI.
// Mantener este archivo como la "fuente de verdad" de las estructuras de datos.
// ==========================================================================

export type Sport = "football" | "nba" | "nfl" | "mlb" | "tennis" | "ufc";

export type Outcome = "home" | "draw" | "away";

/** Niveles de confianza de salida (Sección 7 del diseño). */
export type ConfidenceLevel =
  | "ALTA"
  | "MEDIA_ALTA"
  | "MEDIA"
  | "BAJA"
  | "NO_RECOMENDABLE";

/** Niveles de riesgo (Sección 8 del diseño). */
export type RiskLevel = "BAJO" | "MODERADO" | "ALTO" | "EXTREMO";

/** Etiqueta de agresividad de un mercado recomendado. */
export type MarketTag = "conservador" | "moderado" | "agresivo";

/** Estadísticas de un equipo que alimentan al motor. */
export interface TeamStats {
  teamId: string;
  name: string;
  /** Puntos por partido en los últimos 5 (0..3 en fútbol). */
  formLast5Ppg: number;
  /** Goles a favor por partido (promedio reciente). */
  goalsForPerGame: number;
  /** Goles en contra por partido (promedio reciente). */
  goalsAgainstPerGame: number;
  /** Posición en la tabla (1 = líder). */
  tablePosition: number;
  /** Número de equipos en la liga (para normalizar la posición). */
  leagueSize: number;
  /** Días de descanso desde el último partido. */
  restDays: number;
  /**
   * Impacto de bajas: número "equivalente" de jugadores clave ausentes.
   * 0 = plantel completo; 1 = una baja importante; 2+ = varias bajas clave.
   */
  keyInjuriesImpact: number;
  /** Sentimiento de noticias recientes, de -1 (muy negativo) a +1 (muy positivo). */
  newsSentiment: number;
}

/** Momios 1X2 en formato decimal (europeo). */
export interface Odds1x2 {
  home: number;
  draw: number;
  away: number;
  /** Movimiento de la línea del favorito respecto a la apertura, en %. Opcional. */
  homeLineMovePct?: number;
}

/** Contexto del partido. */
export interface MatchContext {
  /** Importancia del torneo, 0 (amistoso) .. 1 (final / definición). */
  competitionImportance: number;
  /** Historial directo: % de victorias del local en enfrentamientos previos (0..1). */
  h2hHomeWinRate: number;
  /** Número de enfrentamientos directos considerados (para completitud de datos). */
  h2hSampleSize: number;
  /** true si hay factores climáticos adversos conocidos. */
  adverseWeather?: boolean;
}

/** Entrada completa al motor de predicción. */
export interface MatchInput {
  sport: Sport;
  home: TeamStats;
  away: TeamStats;
  context: MatchContext;
  odds?: Odds1x2;
}

/** Aporte de un factor individual, para explicar la predicción en la UI. */
export interface FactorContribution {
  key: string;
  label: string;
  /** Ventaja neta para el LOCAL en puntos de "power" (positivo = favorece al local). */
  homeAdvantage: number;
}

/** Un mercado recomendado con su justificación. */
export interface MarketRecommendation {
  market: string;
  tag: MarketTag;
  /** Probabilidad estimada de que el mercado se cumpla (0..1). */
  probability: number;
  rationale: string;
}

/** Detección de valor: probabilidad del modelo vs. momio. */
export interface ValueSignal {
  outcome: Outcome;
  modelProbability: number;
  marketProbability: number;
  /** Ventaja = prob modelo - prob mercado. */
  edge: number;
  /** Valor esperado por unidad apostada (EV). >0 sugiere valor. */
  expectedValue: number;
  isValue: boolean;
}

/** Salida completa del motor. */
export interface Prediction {
  probabilities: Record<Outcome, number>;
  pick: Outcome;
  pickProbability: number;
  confidence: { level: ConfidenceLevel; score: number };
  risk: { level: RiskLevel; score: number };
  expectedGoals: number;
  factors: FactorContribution[];
  markets: MarketRecommendation[];
  value: ValueSignal[];
  /** Explicación determinista generada por el motor (sin IA). */
  explanation: string;
  /** Advertencia responsable obligatoria. */
  disclaimer: string;
  /** Completitud de datos usada (0..1), afecta confianza. */
  dataCompleteness: number;
}
