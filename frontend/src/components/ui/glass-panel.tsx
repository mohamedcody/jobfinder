import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// This is a transitional component to map legacy GlassPanel to the new Card component.
// It preserves the props interface but uses the new design system under the hood.

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "premium";
  padding?: "none" | "sm" | "default" | "lg";
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", padding = "default", ...props }, ref) => {
    
    const paddingMap = {
      none: "p-0",
      sm: "p-4",
      default: "p-6",
      lg: "p-8",
    };

    return (
      <Card
        ref={ref}
        variant={variant === "interactive" ? "interactive" : "glass"}
        className={cn(paddingMap[padding], className)}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";

// Mock cva for legacy compatibility if anything imports it directly
const glassPanelVariants = () => ""; 

export { GlassPanel, glassPanelVariants };
