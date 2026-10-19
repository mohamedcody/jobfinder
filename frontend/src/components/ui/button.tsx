import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"
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
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-surface-elevated text-foreground border border-border shadow-sm hover:bg-surface-hover hover:border-border-hover active:bg-surface-elevated",
        primary:
          "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(139,44,245,0.3)] hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(139,44,245,0.5)] active:shadow-[0_0_10px_rgba(139,44,245,0.2)]",
        accent:
          "bg-gradient-to-r from-cyan-600 to-accent text-white border border-accent/50 shadow-[0_0_18px_rgba(34,211,238,0.3)] hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-surface-muted text-foreground hover:bg-surface-elevated border border-border/50 active:bg-surface-muted",
        outline:
          "border border-white/15 bg-glass-bg text-slate-300 font-semibold backdrop-blur-sm hover:border-accent/50 hover:bg-accent-soft hover:text-white active:bg-glass-bg",
        danger:
          "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/30 active:bg-danger/15",
        success:
          "bg-success/10 text-success border border-success/20 hover:bg-success/20 hover:border-success/30 active:bg-success/15",
        ghost:
          "hover:bg-surface-hover text-foreground-muted hover:text-foreground active:bg-surface-muted",
        link:
          "text-primary underline-offset-4 hover:underline active:opacity-80",
      },
      size: {
        default: "h-11 px-5 py-2",
        xs: "h-8 rounded-lg px-2.5 text-xs font-medium",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11 p-0 shrink-0",
        "icon-sm": "h-8 w-8 p-0 shrink-0 rounded-lg",
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
  loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, children, disabled, ...props }, ref) => {
    const isDisabled = Boolean(isLoading || disabled);

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-disabled={isDisabled}
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
        disabled={isDisabled}
        aria-busy={isLoading ? "true" : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
