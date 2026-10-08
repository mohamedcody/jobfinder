"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContextualHelpProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function ContextualHelp({ title, description, children }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 ml-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900/95 border border-white/10 rounded-lg shadow-lg backdrop-blur-xl z-50"
          >
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                {title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Arrow pointing down */}
            <div className="absolute top-full left-2 h-2 w-2 bg-slate-900/95 border-r border-b border-white/10 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

interface FieldHelpProps {
  label: string;
  help: string;
}

export function FieldHelp({ label, help }: FieldHelpProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <ContextualHelp title={label} description={help} />
    </div>
  );
}

