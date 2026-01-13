import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        bullish: "border-accent-bullish/30 bg-accent-bullish/20 text-accent-bullish",
        bearish: "border-accent-bearish/30 bg-accent-bearish/20 text-accent-bearish",
        volume: "border-accent-volume/30 bg-accent-volume/20 text-accent-volume",
        smart: "border-accent-smart/30 bg-accent-smart/20 text-accent-smart",
        polymarket: "border-purple-500/30 bg-purple-500/20 text-purple-400",
        kalshi: "border-blue-500/30 bg-blue-500/20 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
