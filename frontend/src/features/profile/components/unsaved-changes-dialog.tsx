"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Check } from "lucide-react";
import { useEffect } from "react";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  hasChanges: boolean;
}

export function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
  hasChanges,
}: UnsavedChangesDialogProps) {
  // Use useEffect to handle side effects like calling onConfirm
  useEffect(() => {
    if (!hasChanges && isOpen) {
      onConfirm();
    }
  }, [hasChanges, isOpen, onConfirm]);

  if (!hasChanges && isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-50"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Unsaved Changes</h3>
                  <p className="text-sm text-slate-400">You have pending changes</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your profile changes haven&apos;t been saved yet. If you cancel now, all unsaved modifications will be lost.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-lg transition-colors border border-white/10"
                >
                  <Check className="h-4 w-4" />
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold rounded-lg transition-colors border border-red-500/30"
                >
                  <X className="h-4 w-4" />
                  Discard
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
