import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Button — Canonical button component for JobFinder PRO
 *
 * This is the SINGLE source of truth for button styling.
 *
 * Variants cover all use-cases:
 *   - default   → neutral surface button
 *   - primary   → violet glow CTA
 *   - accent    → cyan glow action (e.g. send test email)
 *   - secondary → muted surface
 *   - outline   → glass border button
 *   - danger    → destructive action
 *   - success   → positive confirmation
 *   - ghost     → minimal, text-only hover
 *   - link      → styled as a link
 *
 * Sizes: sm, default, lg, icon
 *
 * MIGRATION NOTE:
 *   CSS classes like .btn-glow-primary, .btn-glow-accent, .btn-ghost-premium
 *   are kept in globals.css for existing page-level usage.
 *   As pages are redesigned, they should migrate to this component.
 * ═══════════════════════════════════════════════════════════════════════
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-surface-elevated text-foreground border border-border shadow-sm hover:bg-surface-hover hover:border-border-hover",
        primary:
          "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,44,245,0.3)] hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(139,44,245,0.5)]",
        accent:
          "bg-gradient-to-r from-cyan-600 to-accent text-white border border-accent/50 shadow-[0_0_18px_rgba(34,211,238,0.3)] hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] hover:-translate-y-px",
        secondary:
          "bg-surface-muted text-foreground hover:bg-surface-elevated border border-border/50",
        outline:
          "border border-white/15 bg-glass-bg text-slate-300 font-semibold backdrop-blur-sm hover:border-accent/50 hover:bg-accent-soft hover:text-white",
        danger:
          "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/30",
        success:
          "bg-success/10 text-success border border-success/20 hover:bg-success/20 hover:border-success/30",
        ghost:
          "hover:bg-surface-hover text-foreground-muted hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
