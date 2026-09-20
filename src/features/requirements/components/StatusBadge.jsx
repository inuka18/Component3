import { CheckCircle2, AlertTriangle, PenLine, XCircle } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

const STATUS_CONFIG = {
  Confirmed: { variant: "success", icon: CheckCircle2 },
  "At Risk": { variant: "warning", icon: AlertTriangle },
  Modified: { variant: "info", icon: PenLine },
  Dropped: { variant: "danger", icon: XCircle },
};

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Confirmed;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
