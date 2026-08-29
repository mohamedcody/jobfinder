import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "Avatar", fallback, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-14 w-14 text-base",
      xl: "h-20 w-20 text-xl",
    }

    const [hasError, setHasError] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border border-border bg-surface-elevated items-center justify-center font-bold text-foreground-muted uppercase",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span>{fallback ? fallback.substring(0, 2) : alt.substring(0, 2)}</span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
