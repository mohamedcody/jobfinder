import * as React from "react"
import { cn } from "@/utils/cn"
import { ChevronDown, LucideIcon } from "lucide-react"

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  helperText?: string;
  selectSize?: "sm" | "default" | "lg";
  size?: "sm" | "default" | "lg" | number;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, icon: Icon, error, success, helperText, selectSize, size, id, disabled, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const resolvedSize = (typeof size === "string" ? size : selectSize) || "default";
    const sizeClasses: Record<string, string> = {
      sm: "h-9 text-xs px-3 pr-8",
      default: "h-11 text-sm px-4 pr-10",
      lg: "h-12 text-base px-4 pr-10",
    };

    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none transition-colors peer-focus:text-primary">
            <Icon className={resolvedSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
          </div>
        )}
        <select
          id={selectId}
          size={typeof size === "number" ? size : undefined}
          disabled={disabled}
          aria-invalid={Boolean(error) ? "true" : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "peer appearance-none flex w-full rounded-xl border border-border bg-surface text-foreground shadow-inner transition-all duration-150 cursor-pointer",
            "hover:border-border-hover hover:bg-surface/80",
            "focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-4 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted/50",
            "[&>option]:bg-[#0c0f24] [&>option]:text-slate-200",
            sizeClasses[resolvedSize] || sizeClasses.default,
            Icon && (resolvedSize === "sm" ? "pl-9" : "pl-10"),
            error && "border-danger text-danger focus-visible:border-danger focus-visible:ring-danger/15 hover:border-danger/80",
            success && !error && "border-success focus-visible:border-success focus-visible:ring-success/15 hover:border-success/80",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-foreground-muted peer-focus:text-primary transition-colors">
          <ChevronDown className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 text-xs font-medium text-danger flex items-center gap-1" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-xs text-foreground-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
