import Link from "next/link";

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    period: "",
    highlight: false,
    features: [
      "3 análisis por día",
      "Partidos de hoy",
      "Probabilidad y nivel de confianza",
      "1 deporte (fútbol)",
    ],
  },
  {
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
    name: "Pro / VIP",
    price: "$349",
    period: "MXN / mes",
    highlight: false,
    features: [
      "Todo lo de Premium",
      "Alertas en tiempo real (lesiones, alineaciones, movimiento de momios)",
      "Mercados avanzados y props",
      "Acceso anticipado a nuevos deportes",
      "Soporte prioritario",
    ],
  },
];

export default function PlanesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Planes</h1>
        <p className="mt-1 text-pitch-100/70">
          Precios pensados para México y Latinoamérica. Cancela cuando quieras.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card flex flex-col ${
              plan.highlight ? "border-accent/60 ring-1 ring-accent/40" : ""
            }`}
          >
            {plan.highlight && (
              <span className="pill mb-2 self-start bg-accent/20 text-accent-soft">
                Más popular
              </span>
            )}
            <h2 className="text-lg font-bold">{plan.name}</h2>
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
            <button
              className={`mt-5 rounded-lg py-2 text-sm font-semibold ${
                plan.highlight
                  ? "bg-accent text-pitch-950 hover:bg-accent-soft"
                  : "border border-pitch-700 text-pitch-100/80 hover:border-accent/50"
              }`}
            >
              {plan.price === "$0" ? "Empezar gratis" : "Elegir plan"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-pitch-100/40">
        Los pagos se procesarán con Stripe. Integración pendiente de configurar.{" "}
        <Link href="/" className="text-accent hover:underline">
          Volver
        </Link>
      </p>
    </div>
  );
}
