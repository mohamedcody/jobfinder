import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
  LucideIcon,
} from "lucide-react"

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Alert — Canonical inline notification / banner component for JobFinder PRO
 *
 * Implements accessible inline notifications for feedback, system alerts,
 * and form validation states.
 * ═══════════════════════════════════════════════════════════════════════
 */

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 text-sm [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default:
          "bg-surface-elevated border-border text-foreground [&>svg]:text-foreground-muted",
        primary:
          "bg-primary/10 border-primary/25 text-violet-200 [&>svg]:text-violet-400 shadow-sm shadow-primary/10",
        info:
          "bg-accent/10 border-accent/25 text-cyan-200 [&>svg]:text-cyan-400 shadow-sm shadow-accent/10",
        success:
          "bg-success/10 border-success/25 text-emerald-200 [&>svg]:text-emerald-400 shadow-sm shadow-success/10",
        warning:
          "bg-warning/10 border-warning/25 text-amber-200 [&>svg]:text-amber-400 shadow-sm shadow-warning/10",
        danger:
          "bg-danger/10 border-danger/25 text-rose-200 [&>svg]:text-rose-400 shadow-sm shadow-danger/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const defaultIcons: Record<string, LucideIcon> = {
  default: Info,
  primary: Sparkles,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: LucideIcon | false;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", icon, onClose, children, ...props }, ref) => {
    const isDestructive = variant === "danger" || variant === "warning"
    const IconComponent = icon === false ? null : icon || defaultIcons[variant || "default"]

    return (
      <div
        ref={ref}
        role={isDestructive ? "alert" : "status"}
        aria-live={isDestructive ? "assertive" : "polite"}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {IconComponent && <IconComponent className="h-5 w-5 shrink-0" aria-hidden="true" />}
        <div className="flex-1 min-w-0 pr-6">{children}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss alert"
            className="absolute right-3.5 top-3.5 rounded-lg p-1 text-foreground-muted hover:text-foreground hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight text-white", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs leading-relaxed text-slate-300 opacity-90", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, alertVariants }
