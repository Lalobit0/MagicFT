"use server";

// ==========================================================================
// Acción de "suscripción" para la DEMO: cambia el plan del usuario guardándolo
// en una cookie. NO cobra nada.
// En producción, el botón redirige a Stripe Checkout y el plan se activa por
// webhook al confirmarse el pago (tabla `subscriptions`).
// ==========================================================================
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PLAN_COOKIE } from "@/lib/user";
import type { PlanId } from "@/lib/plan/plans";

export async function setPlanAction(formData: FormData) {
  const plan = String(formData.get("plan")) as PlanId;
  const valid: PlanId[] = ["free", "premium", "pro"];
  if (valid.includes(plan)) {
    cookies().set(PLAN_COOKIE, plan, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  redirect("/");
}
