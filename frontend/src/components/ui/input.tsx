import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-inner transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-muted focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-11",
            error && "border-danger focus-visible:border-danger focus-visible:ring-danger/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
