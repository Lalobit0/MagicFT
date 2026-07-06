import Link from "next/link";
import type { QuotaStatus } from "@/lib/usage/quota";
import type { PlanId } from "@/lib/plan/plans";
import { getPlan } from "@/lib/plan/plans";

/** Muestra el plan actual y la cuota restante del día. */
export function QuotaBanner({ plan, quota }: { plan: PlanId; quota: QuotaStatus }) {
  const planName = getPlan(plan).name;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-pitch-700/60 bg-pitch-800/40 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-pitch-100/60">Plan:</span>
        <span className="pill bg-pitch-700 text-accent-soft">{planName}</span>
        {quota.unlimited ? (
          <span className="text-pitch-100/70">Análisis ilimitados ✨</span>
        ) : (
          <span className="text-pitch-100/70">
            Te quedan{" "}
            <span className="font-bold text-accent">{quota.remaining}</span> de {quota.limit}{" "}
            análisis hoy
          </span>
        )}
      </div>
      {!quota.unlimited && (
        <Link href="/planes" className="text-xs font-semibold text-accent hover:underline">
          Mejorar a Premium →
        </Link>
      )}
    </div>
  );
}
