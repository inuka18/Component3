import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { Button } from "../../../components/ui/button";

// Same disabled-button-with-explanatory-tooltip pattern established in
// Gap Detection (src/features/gap-detection/components/RestrictedButton.jsx).
// Kept as its own local copy rather than a cross-feature import, same as
// every other feature in this app keeps its own small structural helpers.
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
