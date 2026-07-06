// ==========================================================================
// Clasificación de riesgo (Sección 8).
// El riesgo SUBE cuando:
//   - El partido está parejo (poca diferencia entre favorito y rival).
//   - Se esperan muchos goles (más varianza en el resultado).
//   - Hay bajas clave o incertidumbre de alineación.
//   - Faltan datos (baja completitud).
//   - El modelo y el mercado no coinciden (señal contradictoria).
//   - Poco descanso / calendario congestionado o clima adverso.
// ==========================================================================
import type { RiskLevel } from "../types";
import { RISK_BANDS } from "./config";
import { clamp, round } from "./math";

export interface RiskInput {
  pickProbability: number; // 0..1
  expectedGoals: number; // total esperado
  totalKeyInjuries: number; // suma de impacto de bajas de ambos equipos
  dataCompleteness: number; // 0..1
  modelMarketGap?: number; // |prob modelo - prob mercado| del pick
  minRestDays: number; // descanso del equipo más cargado
  adverseWeather: boolean;
}

export function classifyRisk(input: RiskInput): { level: RiskLevel; score: number } {
  const {
    pickProbability,
    expectedGoals,
    totalKeyInjuries,
    dataCompleteness,
    modelMarketGap,
    minRestDays,
    adverseWeather,
  } = input;

  // Parejo → más riesgo (0.75 → 0 ; 0.34 → 45 puntos).
  const closeness = clamp((0.75 - pickProbability) * 110, 0, 45);

  // Muchos goles esperados → más varianza (2.5 goles ≈ neutro).
  const volatility = clamp((expectedGoals - 2.5) * 8, 0, 18);

  // Bajas clave combinadas.
  const injuries = clamp(totalKeyInjuries * 6, 0, 18);

  // Datos incompletos.
  const missingData = clamp((1 - dataCompleteness) * 20, 0, 20);

  // Desacuerdo modelo↔mercado.
  const disagreement =
    modelMarketGap !== undefined ? clamp(modelMarketGap * 60, 0, 15) : 0;

  // Fatiga / calendario.
  const fatigue = clamp((3 - minRestDays) * 3, 0, 9);

  const weather = adverseWeather ? 6 : 0;

  const score = round(
    clamp(
      closeness + volatility + injuries + missingData + disagreement + fatigue + weather,
      0,
      100
    ),
    1
  );

  const level = RISK_BANDS.find((b) => score >= b.min)?.level ?? "BAJO";
  return { level, score };
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  BAJO: "Riesgo bajo",
  MODERADO: "Riesgo moderado",
  ALTO: "Riesgo alto",
  EXTREMO: "Riesgo extremo",
};
