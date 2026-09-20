import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { Button } from "../../../components/ui/button";

// Same disabled-button-with-explanatory-tooltip pattern already established
// in Requirements' Signal Feed for PM-only actions, shared here since
// Gap Detection has one PM-only mutating action per page (Run Detection,
// Mark Reviewed, Retrain Model).
export function RestrictedButton({ label, variant = "outline", size = "sm", children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button variant={variant} size={size} disabled className="pointer-events-none opacity-60">
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
