"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { CvUploaderWidget } from "@/components/cv-parser";
import { FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CvUploadPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI CV Parser
              </h1>
              <p className="text-sm text-slate-400">
                Upload your resume and let AI auto-fill your profile
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Extracts Skills",
              "Maps Education",
              "Detects Experience",
              "Auto-fills Profile",
            ].map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white/3 border border-white/8 rounded-full px-3 py-1"
              >
                <Sparkles className="h-3 w-3 text-violet-500" />
                {feat}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CV Uploader Widget */}
        <CvUploaderWidget />
      </div>
    </AppLayout>
  );
}
