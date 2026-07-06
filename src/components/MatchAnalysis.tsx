import type { Fixture } from "@/lib/data/matches";
import { predict } from "@/lib/engine/predict";
import { ConfidenceBadge, RiskBadge } from "./badges";
import { ProbabilityBar } from "./ProbabilityBar";

const TAG_STYLE: Record<string, string> = {
  conservador: "bg-emerald-500/15 text-emerald-300",
  moderado: "bg-yellow-500/15 text-yellow-300",
  agresivo: "bg-orange-500/15 text-orange-300",
};

export function MatchAnalysis({ fixture }: { fixture: Fixture }) {
  const p = predict(fixture.input);
  const { home, away, odds } = fixture.input;

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="card">
        <div className="mb-1 text-xs text-pitch-100/60">
          {fixture.league} ·{" "}
          {new Date(fixture.kickoff).toLocaleString("es-MX", {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </div>
        <h1 className="text-2xl font-black">
          {home.name} <span className="text-pitch-100/40">vs</span> {away.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <ConfidenceBadge level={p.confidence.level} />
          <RiskBadge level={p.risk.level} />
          <span className="pill bg-pitch-700 text-pitch-100/80">
            Goles esperados: {p.expectedGoals}
          </span>
          <span className="pill bg-pitch-700 text-pitch-100/80">
            Datos: {Math.round(p.dataCompleteness * 100)}%
          </span>
        </div>
      </div>

      {/* Predicción final + explicación */}
      <div className="card">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">
          Predicción final
        </h2>
        <ProbabilityBar
          probabilities={p.probabilities}
          homeName={home.name}
          awayName={away.name}
          pick={p.pick}
        />
        <p className="mt-4 leading-relaxed text-pitch-100/90">{p.explanation}</p>
      </div>

      {/* Factores del análisis */}
      <div className="card">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">
          Factores del análisis
        </h2>
        <div className="space-y-2">
          {p.factors.map((f) => {
            const favorsHome = f.homeAdvantage >= 0;
            const magnitude = Math.min(Math.abs(f.homeAdvantage) * 6, 100);
            return (
              <div key={f.key} className="flex items-center gap-3 text-sm">
                <div className="w-44 shrink-0 text-pitch-100/70">{f.label}</div>
                <div className="flex flex-1 items-center">
                  <div className="flex w-1/2 justify-end">
                    {!favorsHome && (
                      <div
                        className="h-3 rounded-l bg-amber-500/70"
                        style={{ width: `${magnitude}%` }}
                      />
                    )}
                  </div>
                  <div className="flex w-1/2 justify-start">
                    {favorsHome && (
                      <div
                        className="h-3 rounded-r bg-accent/70"
                        style={{ width: `${magnitude}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right text-xs text-pitch-100/50">
                  {f.homeAdvantage > 0 ? "+" : ""}
                  {f.homeAdvantage}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-pitch-100/40">
          <span>◀ favorece a {away.name}</span>
          <span>favorece a {home.name} ▶</span>
        </div>
      </div>

      {/* Mercados recomendados */}
      <div className="card">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">
          Mercados recomendados
        </h2>
        <div className="space-y-2.5">
          {p.markets.map((m, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-lg bg-pitch-900/50 p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{m.market}</span>
                  <span className={`pill ${TAG_STYLE[m.tag]}`}>{m.tag}</span>
                </div>
                <p className="mt-1 text-xs text-pitch-100/60">{m.rationale}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-bold text-accent">
                  {Math.round(m.probability * 100)}%
                </div>
                <div className="text-[10px] text-pitch-100/40">prob. estimada</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparación probabilidad vs momios (valor) */}
      {odds && (
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">
            Probabilidad estimada vs. momios
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-pitch-100/50">
                  <th className="pb-2">Resultado</th>
                  <th className="pb-2">Modelo</th>
                  <th className="pb-2">Mercado</th>
                  <th className="pb-2">Ventaja</th>
                  <th className="pb-2">EV</th>
                  <th className="pb-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {p.value.map((v) => {
                  const label =
                    v.outcome === "home" ? home.name : v.outcome === "away" ? away.name : "Empate";
                  return (
                    <tr key={v.outcome} className="border-t border-pitch-700/50">
                      <td className="py-2">{label}</td>
                      <td className="py-2">{Math.round(v.modelProbability * 100)}%</td>
                      <td className="py-2">{Math.round(v.marketProbability * 100)}%</td>
                      <td className={`py-2 ${v.edge > 0 ? "text-emerald-300" : "text-pitch-100/50"}`}>
                        {v.edge > 0 ? "+" : ""}
                        {Math.round(v.edge * 100)}%
                      </td>
                      <td className={`py-2 ${v.expectedValue > 0 ? "text-emerald-300" : "text-pitch-100/50"}`}>
                        {v.expectedValue > 0 ? "+" : ""}
                        {v.expectedValue}
                      </td>
                      <td className="py-2">
                        {v.isValue ? (
                          <span className="pill bg-emerald-500/15 text-emerald-300">valor ✓</span>
                        ) : (
                          <span className="text-pitch-100/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs leading-relaxed text-yellow-200/80">
        ⚠️ {p.disclaimer}
      </div>
    </div>
  );
}
