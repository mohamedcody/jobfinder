import * as React from "react"
import { cn } from "@/utils/cn"

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Card — Canonical card/container component for JobFinder PRO
 *
 * This is the SINGLE source of truth for card styling.
 *
 * Variants:
 *   - default      → subtle surface with border
 *   - elevated     → more opaque with stronger shadow
 *   - interactive  → hover states for clickable cards
 *   - glass        → glassmorphism (blur + transparency)
 *
 * For legacy code using CSS class `.glass-panel`, prefer this component
 * with variant="glass" instead.
 *
 * Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 * ═══════════════════════════════════════════════════════════════════════
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "glass" | "accent";
  isSelected?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", isSelected = false, ...props }, ref) => {
    const variants = {
      default: "bg-surface/50 border border-border/50",
      elevated: "bg-surface-elevated border border-border shadow-elevated",
      interactive:
        "bg-surface/50 border border-border/50 hover:bg-surface-hover hover:border-border-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-150 cursor-pointer",
      glass: "bg-glass-bg backdrop-blur-xl border border-glass-border shadow-glass",
      accent: "bg-surface-elevated border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.08)]",
    }
    
    return (
      <div
        ref={ref}
        tabIndex={variant === "interactive" && props.tabIndex === undefined ? 0 : props.tabIndex}
        className={cn(
          "rounded-2xl text-foreground transition-colors",
          variants[variant],
          isSelected && "ring-2 ring-primary border-primary/60 bg-primary/[0.04]",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-foreground-muted", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
