import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"
import { X } from "lucide-react"

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Badge — Canonical badge/tag component for JobFinder PRO
 *
 * Replaces all ad-hoc badge/chip implementations.
 *
 * Variants:
 *   - default   → subtle surface badge
 *   - primary   → violet primary
 *   - secondary → muted text
 *   - success   → green confirmation
 *   - warning   → amber alert
 *   - danger    → red destructive
 *   - info      → cyan accent
 *   - outline   → bordered only
 *   - neon      → glowing violet
 * ═══════════════════════════════════════════════════════════════════════
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-border bg-surface-elevated text-foreground hover:bg-surface-hover",
        primary:
          "border-primary/30 bg-primary/15 text-violet-300 shadow-sm shadow-primary/10",
        secondary:
          "border-border/40 bg-surface-muted text-foreground-muted",
        success:
          "border-success/30 bg-success/15 text-emerald-300 shadow-sm shadow-success/10",
        warning:
          "border-warning/30 bg-warning/15 text-amber-300 shadow-sm shadow-warning/10",
        danger:
          "border-danger/30 bg-danger/15 text-rose-300 shadow-sm shadow-danger/10",
        info:
          "border-accent/30 bg-accent/15 text-cyan-300 shadow-sm shadow-accent/10",
        outline:
          "text-foreground border-border hover:border-border-hover bg-transparent",
        neon:
          "border-primary/40 bg-primary/15 text-violet-200 shadow-[0_0_12px_rgba(139,44,245,0.25)] uppercase tracking-wider text-[0.7rem] font-bold",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean;
  onRemove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  dot?: boolean;
  dotColor?: string;
}

function Badge({
  className,
  variant,
  size,
  removable,
  onRemove,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 rounded-full shrink-0", dotColor || "bg-current")}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove item"
          className="ml-1.5 -mr-0.5 rounded-full p-0.5 text-current opacity-70 hover:opacity-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current transition-all cursor-pointer"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export { Badge, badgeVariants }
