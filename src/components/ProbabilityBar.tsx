import type { Outcome } from "@/lib/types";

interface Props {
  probabilities: Record<Outcome, number>;
  homeName: string;
  awayName: string;
  pick: Outcome;
}

export function ProbabilityBar({ probabilities, homeName, awayName, pick }: Props) {
  const seg = (label: string, p: number, color: string, active: boolean) => (
    <div
      className={`flex h-full flex-col items-center justify-center overflow-hidden text-center transition-all ${
        active ? "font-bold" : "opacity-80"
      }`}
      style={{ width: `${Math.max(p * 100, 8)}%`, backgroundColor: color }}
      title={`${label}: ${Math.round(p * 100)}%`}
    >
      <span className="px-1 text-[11px] leading-tight text-pitch-950">{Math.round(p * 100)}%</span>
    </div>
  );

  return (
    <div>
      <div className="flex h-10 w-full overflow-hidden rounded-lg">
        {seg(homeName, probabilities.home, "#22d3a6", pick === "home")}
        {seg("Empate", probabilities.draw, "#94a3b8", pick === "draw")}
        {seg(awayName, probabilities.away, "#f59e0b", pick === "away")}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-pitch-100/60">
        <span>🏠 {homeName}</span>
        <span>Empate</span>
        <span>{awayName} ✈️</span>
      </div>
    </div>
  );
}
