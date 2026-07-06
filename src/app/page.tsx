import { MatchCard } from "@/components/MatchCard";
import { getTodayMatches, getUpcomingMatches, getAllMatches } from "@/lib/data/matches";
import { predict } from "@/lib/engine/predict";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [today, upcoming, all] = await Promise.all([
    getTodayMatches(),
    getUpcomingMatches(),
    getAllMatches(),
  ]);

  // Ranking de picks más confiables (excluye los no recomendables).
  const ranking = all
    .map((f) => ({ fixture: f, p: predict(f.input) }))
    .filter((r) => r.p.confidence.level !== "NO_RECOMENDABLE")
    .sort((a, b) => b.p.confidence.score - a.p.confidence.score)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-black tracking-tight">
          Analiza. Decide con <span className="text-accent">datos</span>.
        </h1>
        <p className="mt-2 max-w-2xl text-pitch-100/70">
          Probabilidades, nivel de confianza, riesgo y mercados recomendados para cada partido.
          Sin promesas mágicas: análisis claro para tomar mejores decisiones.
        </p>
      </section>

      {ranking.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-bold">🏆 Picks más confiables</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ranking.map((r) => (
              <MatchCard key={r.fixture.id} fixture={r.fixture} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">📅 Partidos de hoy</h2>
        {today.length === 0 ? (
          <p className="text-pitch-100/50">No hay partidos en las próximas 24 horas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {today.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">⏭️ Próximos partidos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-pitch-100/40">
        ¿Quieres análisis ilimitados y alertas?{" "}
        <Link href="/planes" className="text-accent hover:underline">
          Ver planes
        </Link>
      </p>
    </div>
  );
}
