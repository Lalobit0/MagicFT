// ==========================================================================
// Lógica de cuota por plan. Decide si un usuario puede ver un análisis y
// consume la cuota cuando corresponde.
// ==========================================================================
import { getPlan, type PlanId } from "../plan/plans";
import { analysesUsedToday, hasAnalyzed, recordAnalysis } from "./store";

export interface QuotaStatus {
  limit: number | null; // null = ilimitado
  used: number;
  remaining: number | null; // null = ilimitado
  unlimited: boolean;
}

export function getQuota(uid: string, plan: PlanId): QuotaStatus {
  const { dailyAnalysisLimit } = getPlan(plan);
  const used = analysesUsedToday(uid);
  if (dailyAnalysisLimit === null) {
    return { limit: null, used, remaining: null, unlimited: true };
  }
  return {
    limit: dailyAnalysisLimit,
    used,
    remaining: Math.max(0, dailyAnalysisLimit - used),
    unlimited: false,
  };
}

/** ¿Puede este usuario abrir el análisis de este partido hoy? */
export function canAnalyze(uid: string, plan: PlanId, matchId: string): boolean {
  const { dailyAnalysisLimit } = getPlan(plan);
  if (dailyAnalysisLimit === null) return true; // ilimitado
  if (hasAnalyzed(uid, matchId)) return true; // ya lo vio hoy, no recuenta
  return analysesUsedToday(uid) < dailyAnalysisLimit;
}

/**
 * Intenta consumir un análisis para este partido. Devuelve si se permitió.
 * Idempotente por partido/día (ver store.ts).
 */
export function consumeAnalysis(
  uid: string,
  plan: PlanId,
  matchId: string
): { allowed: boolean; quota: QuotaStatus } {
  const allowed = canAnalyze(uid, plan, matchId);
  if (allowed) recordAnalysis(uid, matchId);
  return { allowed, quota: getQuota(uid, plan) };
}
