import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { Button } from "../../../components/ui/button";

// Same disabled-button-with-explanatory-tooltip pattern used by every
// other feature in this app (Gap Detection, Retrospective Intelligence,
// …), kept as its own local copy rather than a cross-feature import.
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
