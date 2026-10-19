import * as React from "react"
import { cn } from "@/utils/cn"
import { LucideIcon, Loader2, CheckCircle2 } from "lucide-react"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  rightElement?: React.ReactNode;
  error?: string;
  success?: boolean;
  helperText?: string;
  isLoading?: boolean;
  inputSize?: "sm" | "default" | "lg";
  size?: "sm" | "default" | "lg" | number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      icon: Icon,
      rightIcon: RightIcon,
      rightElement,
      error,
      success,
      helperText,
      isLoading,
      inputSize,
      size,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const resolvedSize = (typeof size === "string" ? size : inputSize) || "default";
    const sizeClasses: Record<string, string> = {
      sm: "h-9 text-xs px-3",
      default: "h-11 text-sm px-4",
      lg: "h-12 text-base px-4",
    };

    const hasRightContent = Boolean(rightElement || RightIcon || isLoading || success);

    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none transition-colors peer-focus:text-primary">
            <Icon className={resolvedSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          size={typeof size === "number" ? size : undefined}
          disabled={disabled || isLoading}
          aria-invalid={Boolean(error) ? "true" : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "peer flex w-full rounded-xl border border-border bg-surface text-foreground shadow-inner transition-all duration-150",
            "placeholder:text-foreground-muted/70",
            "hover:border-border-hover hover:bg-surface/80",
            "focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-4 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted/50",
            sizeClasses[resolvedSize] || sizeClasses.default,
            Icon && (resolvedSize === "sm" ? "pl-9" : "pl-10"),
            hasRightContent && (resolvedSize === "sm" ? "pr-9" : "pr-10"),
            error && "border-danger text-danger placeholder:text-danger/50 focus-visible:border-danger focus-visible:ring-danger/15 hover:border-danger/80",
            success && !error && "border-success focus-visible:border-success focus-visible:ring-success/15 hover:border-success/80",
            className
          )}
          ref={ref}
          {...props}
        />
        {hasRightContent && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-foreground-muted">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" aria-hidden="true" />
            ) : success && !error ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
            ) : RightIcon ? (
              <RightIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
            ) : (
              rightElement
            )}
          </div>
        )}
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
Input.displayName = "Input"

export { Input }
