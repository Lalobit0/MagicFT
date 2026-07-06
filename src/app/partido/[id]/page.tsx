import { MatchAnalysis } from "@/components/MatchAnalysis";
import { getMatchById } from "@/lib/data/matches";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: { id: string } }) {
  const fixture = await getMatchById(params.id);
  if (!fixture) notFound();

  return (
    <div>
      <Link href="/" className="mb-4 inline-block text-sm text-pitch-100/60 hover:text-accent">
        ← Volver a partidos
      </Link>
      <MatchAnalysis fixture={fixture} />
    </div>
  );
}
