import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "appearance-none flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 pr-10 text-sm text-foreground shadow-inner transition-colors focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:border-danger focus-visible:ring-danger/10",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
