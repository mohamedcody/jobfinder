"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

export function SubmitButton({ isLoading, children, disabled, className, ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`btn-glow-primary btn-shine relative w-full overflow-hidden rounded-xl px-4 py-4 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 mt-2 ${className ?? ""}`}
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
    </button>
  );
}
