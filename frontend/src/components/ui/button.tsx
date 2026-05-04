import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white hover:bg-white/15 border border-white/10 shadow-lg hover:shadow-xl",
        primary:
          "btn-glow-primary btn-shine relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,44,245,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-white/10 text-slate-300 hover:text-white",
        danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-10 w-10",
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
