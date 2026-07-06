// ==========================================================================
// Usuario actual (lado servidor).
//
// DEMO: identifica al visitante con una cookie anónima (`mft_uid`) y guarda su
// plan en otra cookie (`mft_plan`) para poder probar el flujo de suscripción
// sin pagos reales. En producción esto se reemplaza por Supabase Auth:
// el `uid` sería `auth.users.id` y el `plan` vendría de la tabla `subscriptions`.
// ==========================================================================
import { cookies } from "next/headers";
import type { PlanId } from "./plan/plans";

export const UID_COOKIE = "mft_uid";
export const PLAN_COOKIE = "mft_plan";

export interface CurrentUser {
  uid: string;
  plan: PlanId;
}

function isPlan(value: string | undefined): value is PlanId {
  return value === "free" || value === "premium" || value === "pro";
}

export function getCurrentUser(): CurrentUser {
  const jar = cookies();
  // El middleware garantiza la cookie; si faltara (1a visita), usamos un
  // marcador estable para no romper el render.
  const uid = jar.get(UID_COOKIE)?.value ?? "anon";
  const planValue = jar.get(PLAN_COOKIE)?.value;
  const plan: PlanId = isPlan(planValue) ? planValue : "free";
  return { uid, plan };
}
