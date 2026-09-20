import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

// Same threshold-to-variant mapping style as Gap Detection's SeverityBadge.
// A high semantic score means the structured code and the NLP-extracted
// cause genuinely agree; a low one is exactly the discrepancy this
// feature exists to surface.
const THRESHOLDS = [
  { min: 75, variant: "success", icon: CheckCircle2, label: "Strong Match" },
  { min: 50, variant: "warning", icon: AlertTriangle, label: "Partial Match" },
  { min: 0, variant: "danger", icon: XCircle, label: "Mismatch" },
];

export function MatchScoreBadge({ score, showLabel = false, className }) {
  const tier = THRESHOLDS.find((t) => score >= t.min) ?? THRESHOLDS[THRESHOLDS.length - 1];
  const Icon = tier.icon;
  return (
    <Badge variant={tier.variant} className={className}>
      <Icon className="h-3 w-3" />
      {score}% {showLabel ? tier.label : "match"}
    </Badge>
  );
}
