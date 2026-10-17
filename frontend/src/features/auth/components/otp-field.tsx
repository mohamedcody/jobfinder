import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface OtpFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export const OtpField = forwardRef<HTMLInputElement, OtpFieldProps>(
  ({ id, label, error, className, ...props }, ref) => {
    const errorId = `${id}-error`;

    return (
      <div className="group mb-4">
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-foreground-muted group-focus-within:text-primary transition-colors"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          aria-invalid={Boolean(error) ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full h-12 rounded-xl border border-border bg-surface px-4 text-center font-mono text-lg font-bold tracking-[0.4em] text-foreground transition-all duration-150 shadow-inner",
            "placeholder:text-foreground-muted/50 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm",
            "hover:border-border-hover hover:bg-surface/80",
            "focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-4 focus-visible:ring-primary/15",
            error && "border-danger text-danger focus-visible:border-danger focus-visible:ring-danger/15",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="mt-1.5 text-xs font-medium text-danger flex items-center gap-1" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

OtpField.displayName = "OtpField";
