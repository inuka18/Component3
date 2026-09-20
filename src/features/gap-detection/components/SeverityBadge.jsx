import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

const SEVERITY_CONFIG = {
  High: { variant: "danger", icon: AlertTriangle },
  Medium: { variant: "warning", icon: AlertCircle },
  Low: { variant: "secondary", icon: Info },
};

export function SeverityBadge({ severity, className }) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.Low;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3 w-3" />
      {severity}
    </Badge>
  );
}
