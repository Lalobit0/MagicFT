import Link from "next/link";

/** Se muestra cuando un usuario del plan gratis agota sus análisis del día. */
export function Paywall({ used, limit }: { used: number; limit: number }) {
  return (
    <div className="card border-accent/40 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-2xl">
        🔒
      </div>
      <h2 className="text-xl font-black">Llegaste a tu límite de hoy</h2>
      <p className="mx-auto mt-2 max-w-md text-pitch-100/70">
        Usaste tus <span className="font-semibold text-accent">{used}</span> de {limit} análisis
        gratis del día. Con <span className="font-semibold">Premium</span> tienes análisis{" "}
        <span className="font-semibold">ilimitados</span>, comparación con momios, detección de
        valor, ranking del día e historial de aciertos.
      </p>

      <div className="mx-auto mt-4 max-w-sm rounded-xl bg-pitch-900/60 p-4 text-left text-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-semibold">Premium</span>
          <span>
            <span className="text-2xl font-black">$149</span>{" "}
            <span className="text-xs text-pitch-100/50">MXN/mes</span>
          </span>
        </div>
        <ul className="space-y-1 text-pitch-100/80">
          <li>✓ Análisis ilimitados</li>
          <li>✓ Comparación con momios y detección de valor</li>
          <li>✓ Ranking de picks e historial de aciertos</li>
        </ul>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <Link
          href="/planes"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-pitch-950 hover:bg-accent-soft"
        >
          Ver planes y suscribirme
        </Link>
        <Link href="/" className="text-xs text-pitch-100/50 hover:text-accent">
          Volver a partidos
        </Link>
      </div>

      <p className="mt-4 text-[11px] text-pitch-100/40">
        Tu cuota se reinicia mañana. Análisis informativo, no garantiza resultados. +18.
      </p>
    </div>
  );
}

/** Candado para secciones que requieren Premium (ej. momios/valor). */
export function PremiumLock({ title }: { title: string }) {
  return (
    <div className="card relative overflow-hidden">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">{title}</h2>
      <div className="rounded-lg border border-dashed border-pitch-700 bg-pitch-900/40 p-6 text-center">
        <div className="mb-2 text-2xl">🔒</div>
        <p className="text-sm text-pitch-100/70">
          La comparación con momios y la <span className="font-semibold">detección de valor</span>{" "}
          están disponibles en <span className="font-semibold text-accent">Premium</span>.
        </p>
        <Link
          href="/planes"
          className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-pitch-950 hover:bg-accent-soft"
        >
          Desbloquear con Premium
        </Link>
      </div>
    </div>
  );
}
