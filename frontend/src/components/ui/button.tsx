import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        primary:
          "btn-glow-primary btn-shine relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,44,245,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-105 active:scale-95",
        secondary:
          "bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border border-slate-600/30 hover:text-white",
        ghost: 
          "hover:bg-white/10 text-slate-300 hover:text-white",
        danger: 
          "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:text-red-300",
        success:
          "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 hover:text-green-300",
        warning:
          "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 hover:text-amber-300",
        outline:
          "bg-transparent border-2 border-white/20 text-white hover:bg-white/5 hover:border-white/40",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        sm: "h-9 px-4 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-14 px-10 text-base",
        xl: "h-16 px-12 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
