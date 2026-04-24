import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassPanelVariants = cva(
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
        interactive: "hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] cursor-pointer hover:-translate-y-0.5",
        premium: "border-violet-500/30 bg-linear-to-br from-violet-900/20 to-cyan-900/20 shadow-[0_0_20px_rgba(160,32,240,0.15)]",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassPanelVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel, glassPanelVariants };
