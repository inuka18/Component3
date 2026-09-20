import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { Button } from "../../../components/ui/button";

// Same disabled-button-with-explanatory-tooltip pattern already
// established across the app (Requirements' Signal Feed, Gap Detection,
// Schedule). This feature keeps its own copy rather than importing
// another feature's, since each feature owns its own component tree.
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
