import Link from "next/link";
import type { Fixture } from "@/lib/data/matches";
import { predict } from "@/lib/engine/predict";
import { ConfidenceBadge, RiskBadge } from "./badges";

function kickoffLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchCard({ fixture }: { fixture: Fixture }) {
  const p = predict(fixture.input);
  const { home, away } = fixture.input;
  const favName = p.pick === "home" ? home.name : p.pick === "away" ? away.name : "Empate";
  const favPct = Math.round(p.pickProbability * 100);

  return (
    <Link href={`/partido/${fixture.id}`} className="block">
      <div className="card transition-colors hover:border-accent/50">
        <div className="mb-3 flex items-center justify-between text-xs text-pitch-100/60">
          <span>{fixture.league}</span>
          <span>{kickoffLabel(fixture.kickoff)}</span>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex-1 text-right">
            <div className="font-semibold">{home.name}</div>
            <div className="text-xs text-pitch-100/50">Local</div>
          </div>
          <div className="px-3 text-sm text-pitch-100/40">vs</div>
          <div className="flex-1 text-left">
            <div className="font-semibold">{away.name}</div>
            <div className="text-xs text-pitch-100/50">Visitante</div>
          </div>
        </div>

        <div className="mb-3 rounded-lg bg-pitch-900/60 p-2.5 text-center text-sm">
          {p.confidence.level === "NO_RECOMENDABLE" ? (
            <span className="text-red-300">Partido no recomendable para pronóstico</span>
          ) : (
            <>
              Favorece a <span className="font-bold text-accent">{favName}</span>{" "}
              <span className="text-pitch-100/70">({favPct}%)</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceBadge level={p.confidence.level} />
          <RiskBadge level={p.risk.level} />
        </div>
      </div>
    </Link>
  );
}
