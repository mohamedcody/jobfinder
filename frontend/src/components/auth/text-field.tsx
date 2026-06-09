"use client";

import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative group mb-1">
        <label htmlFor={id} className={`mb-2 block text-[0.925rem] font-medium transition-colors duration-300 ${isFocused ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-300'}`}>
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`}
              animate={isFocused ? { y: ["-50%", "-65%", "-50%"] } : { y: "-50%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Icon size={20} />
            </motion.div>
          )}
          <input
            ref={ref}
            id={id}
            onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
            className={`w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-white shadow-inner placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 focus:ring-4 focus:ring-cyan-400/15 ${Icon ? 'pl-12' : ''}`}
            {...props}
          />
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

TextField.displayName = "TextField";
