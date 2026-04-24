import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.2)]",
        neon: "bg-linear-to-r from-violet-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(160,32,240,0.4)] hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] border border-white/10",
        ghost: "hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/10",
        danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
