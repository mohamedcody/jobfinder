"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

interface BioGeneratorProps {
  currentJobTitle?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  onBioGenerated: (bio: string) => void;
}

export function BioGenerator({
  currentJobTitle,
  yearsOfExperience,
  educationLevel,
  onBioGenerated,
}: BioGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBio, setGeneratedBio] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateBio = async () => {
    setIsGenerating(true);
    try {

      // For now, we'll generate a template-based bio
      // In production, this would call an actual AI API
      const bio = generateTemplateBio(
        currentJobTitle,
        yearsOfExperience,
        educationLevel
      );
      setGeneratedBio(bio);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTemplateBio = (
    title?: string,
    years?: number,
    education?: string
  ): string => {
    const templates: string[] = [];

    if (title && years) {
      templates.push(
        `${title} with ${years}+ years of experience. Passionate about delivering high-quality solutions and driving innovation in the tech industry.`
      );
    }

    if (education && title) {
      templates.push(
        `${education} graduate and skilled ${title}. Committed to leveraging my expertise to solve complex problems and contribute to dynamic teams.`
      );
    }

    if (title && !years && !education) {
      templates.push(
        `${title} dedicated to excellence and continuous learning. Ready to bring strong technical skills and collaborative mindset to a forward-thinking organization.`
      );
    }

    if (!templates.length) {
      templates.push(
        "Dedicated professional seeking new opportunities to contribute my skills and grow with a dynamic team. Committed to excellence and continuous improvement."
      );
    }

    return templates[Math.floor(Math.random() * templates.length)];
  };

  const copyToClipboard = () => {
    if (generatedBio) {
      navigator.clipboard.writeText(generatedBio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const useBio = () => {
    if (generatedBio) {
      onBioGenerated(generatedBio);
      setGeneratedBio(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-bold text-purple-300">AI Bio Generator</h3>
        </div>

        {!generatedBio ? (
          <button
            type="button"
            onClick={generateBio}
            disabled={isGenerating}
            className="w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold text-sm transition-colors border border-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Bio
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-300 p-3 rounded-lg bg-white/5 border border-white/10 leading-relaxed">
              {generatedBio}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-colors border border-white/10 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={useBio}
                className="flex-1 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold text-sm transition-colors border border-purple-500/30"
              >
                Use This Bio
              </button>
            </div>

            <button
              type="button"
              onClick={() => setGeneratedBio(null)}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Generate Another
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

