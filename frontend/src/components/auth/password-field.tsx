"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, icon: Icon, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative group mb-1">
        <label htmlFor={id} className={`mb-2 block text-sm font-semibold transition-colors duration-300 ${isFocused ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-300'}`}>
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <motion.div 
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`}
              animate={isFocused ? { y: ["-50%", "-65%", "-50%"] } : { y: "-50%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Icon size={18} />
            </motion.div>
          )}
          <input
            ref={ref}
            id={id}
            type={isVisible ? "text" : "password"}
            onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
            className={`w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 pr-24 text-sm text-white shadow-inner placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/15 ${Icon ? 'pl-11' : ''}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 inline-flex h-8 -translate-y-1/2 items-center rounded-md px-2 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        </div>
        {error ? (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs font-medium text-rose-400">
            {error}
          </motion.p>
        ) : null}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
