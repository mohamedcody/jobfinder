import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-surface-elevated text-foreground",
        primary:
          "border-primary/20 bg-primary/10 text-primary-foreground",
        secondary:
          "border-transparent bg-surface-muted text-foreground-muted",
        success:
          "border-success/20 bg-success/10 text-success",
        warning:
          "border-warning/20 bg-warning/10 text-warning",
        danger:
          "border-danger/20 bg-danger/10 text-danger",
        info:
          "border-accent/20 bg-accent/10 text-accent",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
