import logo from "../../assets/logo.png";
import { cn } from "../../lib/utils";

/**
 * Renders the product logo inside a soft light "chip" so it stays legible
 * against the always-dark sidebar in both the light and dark app themes.
 * If src/assets/logo.png is swapped for a different file later, this
 * wrapper keeps working unchanged.
 */
export function Logo({ className, imgClassName }) {
  return (
    <div
      className={cn(
        "flex items-center rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm ring-1 ring-black/5",
        className
      )}
    >
      <img src={logo} alt="InSpiD-TECH" className={cn("h-7 w-auto", imgClassName)} />
    </div>
  );
}
