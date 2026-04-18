"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

export function SubmitButton({ isLoading, children, disabled, ...props }: SubmitButtonProps) {
  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-4 py-[0.95rem] text-[15px] font-bold text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all disabled:cursor-not-allowed disabled:opacity-60 hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] group border border-white/10 mt-2"
      {...props}
    >
      {/* Shine Effect */}
      <motion.div 
        className="absolute top-0 -left-[100%] h-full w-[40%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        animate={{ left: ["-100%", "250%"] }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
      />
      
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
    </motion.button>
  );
}
