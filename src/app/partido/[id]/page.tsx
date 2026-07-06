import { MatchAnalysis } from "@/components/MatchAnalysis";
import { Paywall } from "@/components/Paywall";
import { QuotaBanner } from "@/components/QuotaBanner";
import { getMatchById } from "@/lib/data/matches";
import { getPlan } from "@/lib/plan/plans";
import { getCurrentUser } from "@/lib/user";
import { consumeAnalysis } from "@/lib/usage/quota";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const fixture = await getMatchById(params.id);
  if (!fixture) notFound();

  const { uid, plan } = getCurrentUser();
  // Consume cuota (idempotente por partido/día: re-abrir no vuelve a cobrar).
  const { allowed, quota } = consumeAnalysis(uid, plan, params.id);
  const canSeeValue = getPlan(plan).features.valueAndOdds;

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-pitch-100/60 hover:text-accent">
        ← Volver a partidos
      </Link>
      <QuotaBanner plan={plan} quota={quota} />
      {allowed ? (
        <MatchAnalysis fixture={fixture} showValue={canSeeValue} />
      ) : (
        <Paywall used={quota.used} limit={quota.limit ?? 3} />
      )}
    </div>
  );
}
