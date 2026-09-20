import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success:
          "border-transparent bg-status-confirmed-bg text-status-confirmed-fg",
        warning: "border-transparent bg-status-atrisk-bg text-status-atrisk-fg",
        info: "border-transparent bg-status-modified-bg text-status-modified-fg",
        danger: "border-transparent bg-status-dropped-bg text-status-dropped-fg",
        ripple: "border-transparent bg-status-ripple-bg text-status-ripple-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
