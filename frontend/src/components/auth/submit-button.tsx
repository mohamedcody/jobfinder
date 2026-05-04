"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button"; // Import the new Button component

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

export function SubmitButton({ isLoading, children, disabled, className, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      disabled={disabled || isLoading}
      className={`w-full mt-2 ${className ?? ""}`}
      {...props}
    >
      {isLoading ? (
        <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Processing...
        </span>
      ) : (
        <span className="relative z-10 flex items-center justify-center w-full tracking-wide">
          {children}
        </span>
      )}
    </Button>
  );
}
