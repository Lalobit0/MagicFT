import type { ConfidenceLevel, RiskLevel } from "@/lib/types";
import { CONFIDENCE_LABEL } from "@/lib/engine/confidence";
import { RISK_LABEL } from "@/lib/engine/risk";

const CONFIDENCE_STYLE: Record<ConfidenceLevel, string> = {
  ALTA: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  MEDIA_ALTA: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
  MEDIA: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  BAJA: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  NO_RECOMENDABLE: "bg-red-500/15 text-red-300 border border-red-500/30",
};

const RISK_STYLE: Record<RiskLevel, string> = {
  BAJO: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  MODERADO: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  ALTO: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  EXTREMO: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return <span className={`pill ${CONFIDENCE_STYLE[level]}`}>{CONFIDENCE_LABEL[level]}</span>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`pill ${RISK_STYLE[level]}`}>{RISK_LABEL[level]}</span>;
}
