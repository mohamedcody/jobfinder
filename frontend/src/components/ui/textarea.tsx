import * as React from "react"
import { cn } from "@/utils/cn"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  success?: boolean;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, helperText, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="relative w-full">
        <textarea
          id={textareaId}
          disabled={disabled}
          aria-invalid={Boolean(error) ? "true" : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "flex min-h-[90px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-inner transition-all duration-150 resize-y",
            "placeholder:text-foreground-muted/70",
            "hover:border-border-hover hover:bg-surface/80",
            "focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-4 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted/50",
            error && "border-danger text-danger placeholder:text-danger/50 focus-visible:border-danger focus-visible:ring-danger/15 hover:border-danger/80",
            success && !error && "border-success focus-visible:border-success focus-visible:ring-success/15 hover:border-success/80",
            className
          )}
          ref={ref}
          {...props}
        />
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
Textarea.displayName = "Textarea"

export { Textarea }
