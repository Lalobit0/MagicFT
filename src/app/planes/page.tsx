import Link from "next/link";
import { setPlanAction } from "./actions";
import { getCurrentUser } from "@/lib/user";
import type { PlanId } from "@/lib/plan/plans";

export const dynamic = "force-dynamic";

const PLAN_CARDS: {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  highlight: boolean;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Gratis",
    price: "$0",
    period: "",
    highlight: false,
    features: [
      "3 análisis por día",
      "Partidos de hoy",
      "Probabilidad, confianza y riesgo",
      "1 deporte (fútbol)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$149",
    period: "MXN / mes",
    highlight: true,
    features: [
      "Análisis ilimitados",
      "Comparación con momios y detección de valor",
      "Ranking de picks del día",
      "Historial de predicciones y % de acierto",
      "Alertas básicas",
    ],
  },
  {
    id: "pro",
    name: "Pro / VIP",
    price: "$349",
    period: "MXN / mes",
    highlight: false,
    features: [
      "Todo lo de Premium",
      "Alertas en tiempo real (lesiones, alineaciones, momios)",
      "Mercados avanzados y props",
      "Acceso anticipado a nuevos deportes",
      "Soporte prioritario",
    ],
  },
];

export default function PlanesPage() {
  const { plan: currentPlan } = getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Planes</h1>
        <p className="mt-1 text-pitch-100/70">
          Precios pensados para México y Latinoamérica. Cancela cuando quieras.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_CARDS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`card flex flex-col ${
                plan.highlight ? "border-accent/60 ring-1 ring-accent/40" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {plan.highlight && (
                  <span className="pill bg-accent/20 text-accent-soft">Más popular</span>
                )}
                {isCurrent && (
                  <span className="pill bg-emerald-500/15 text-emerald-300">Tu plan</span>
                )}
              </div>
              <h2 className="mt-2 text-lg font-bold">{plan.name}</h2>
              <div className="mt-1">
                <span className="text-3xl font-black">{plan.price}</span>{" "}
                <span className="text-xs text-pitch-100/50">{plan.period}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-pitch-100/80">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-accent">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <form action={setPlanAction} className="mt-5">
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                    isCurrent
                      ? "cursor-default border border-pitch-700 text-pitch-100/40"
                      : plan.highlight
                        ? "bg-accent text-pitch-950 hover:bg-accent-soft"
                        : "border border-pitch-700 text-pitch-100/80 hover:border-accent/50"
                  }`}
                >
                  {isCurrent ? "Plan actual" : plan.price === "$0" ? "Cambiar a Gratis" : "Elegir plan"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-center text-xs text-yellow-200/80">
        🧪 Modo demo: al elegir un plan se activa al instante (sin cobro) para que pruebes el flujo.
        En producción, este botón abre el pago con Stripe y el plan se activa al confirmarse.
      </div>

      <p className="text-center text-xs text-pitch-100/40">
        <Link href="/" className="text-accent hover:underline">
          Volver a partidos
        </Link>
      </p>
    </div>
  );
}
