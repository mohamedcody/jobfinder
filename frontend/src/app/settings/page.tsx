"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useEmailAlerts } from "@/hooks/use-email-alerts";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Mail,
  Send,
  Shield,
  Gauge,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Settings,
  Zap,
} from "lucide-react";

/* ─── Skeleton for loading state ─────────────────── */
function SettingsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-72 bg-white/5 rounded-xl" />
        <div className="h-5 w-96 bg-white/5 rounded-lg" />
      </div>
      {/* Card skeleton */}
      <div className="rounded-[2.5rem] bg-white/5 border border-white/5 p-10 space-y-10">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-white/5 rounded-lg" />
            <div className="h-4 w-72 bg-white/5 rounded-lg" />
          </div>
          <div className="h-8 w-16 bg-white/5 rounded-full" />
        </div>
        <div className="h-px bg-white/5" />
        <div className="space-y-4">
          <div className="h-6 w-56 bg-white/5 rounded-lg" />
          <div className="h-4 w-full bg-white/5 rounded-full" />
          <div className="h-4 w-32 bg-white/5 rounded-lg" />
        </div>
        <div className="h-px bg-white/5" />
        <div className="flex justify-end gap-4">
          <div className="h-12 w-40 bg-white/5 rounded-2xl" />
          <div className="h-12 w-36 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Toggle Switch ──────────────────────────────── */
function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  id,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full 
        transition-all duration-300 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07091a]
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked
          ? "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_rgba(139,44,245,0.4)]"
          : "bg-white/10 border border-white/10"
        }
      `}
    >
      <span
        className={`
          pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg
          transition-all duration-300 ease-in-out
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

/* ─── Score Label Utility ────────────────────────── */
function getScoreLabel(score: number): { text: string; color: string } {
  if (score <= 20) return { text: "Very Broad", color: "text-red-400" };
  if (score <= 40) return { text: "Broad", color: "text-amber-400" };
  if (score <= 60) return { text: "Balanced", color: "text-cyan-400" };
  if (score <= 80) return { text: "Selective", color: "text-emerald-400" };
  return { text: "Highly Selective", color: "text-violet-400" };
}

/* ─── Main Settings Page ─────────────────────────── */
export default function SettingsPage() {
  const {
    settings,
    isLoading,
    isSaving,
    isSendingTest,
    error,
    fetchSettings,
    updateSettings,
    sendTestEmail,
  } = useEmailAlerts();

  // Local form state (separate from server state for dirty detection)
  const [localDigest, setLocalDigest] = useState(true);
  const [localScore, setLocalScore] = useState(60);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync server state → local state when settings load
  useEffect(() => {
    if (settings) {
      setLocalDigest(settings.dailyDigestEnabled);
      setLocalScore(settings.minMatchScore);
      setIsDirty(false);
    }
  }, [settings]);

  // Dirty detection
  useEffect(() => {
    if (!settings) return;
    const changed =
      localDigest !== settings.dailyDigestEnabled ||
      localScore !== settings.minMatchScore;
    setIsDirty(changed);
    if (changed) setSaveSuccess(false);
  }, [localDigest, localScore, settings]);

  // Save handler
  const handleSave = useCallback(async () => {
    const result = await updateSettings({
      dailyDigestEnabled: localDigest,
      minMatchScore: localScore,
    });
    if (result) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }, [localDigest, localScore, updateSettings]);

  // Discard changes
  const handleDiscard = useCallback(() => {
    if (settings) {
      setLocalDigest(settings.dailyDigestEnabled);
      setLocalScore(settings.minMatchScore);
    }
  }, [settings]);

  const scoreLabel = getScoreLabel(localScore);

  // Error state with retry
  if (error && !settings) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[2.5rem] bg-[#0a0c24] border border-red-500/20 p-12 text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Failed to Load Settings</h2>
            <p className="text-slate-400 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchSettings}
              className="btn-glow-primary px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-3"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="space-y-8"
          >
            {/* ─── Page Header ─────────────────────────── */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0c24] border border-white/5 p-8 sm:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-violet-600/8 to-transparent pointer-events-none" />
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-600/5 blur-[80px] pointer-events-none" />
              <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-cyan-500/5 blur-[60px] pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/10 border border-violet-500/20 flex items-center justify-center shadow-lg">
                  <Settings className="h-7 w-7 text-violet-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-violet-400 mb-3">
                    <Sparkles className="h-3 w-3" />
                    Notification Preferences
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Email Alert{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                      Settings
                    </span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-2 max-w-lg">
                    Configure your daily job-matching digest. We&apos;ll send curated roles that
                    match your profile above your quality threshold.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Main Settings Card ─────────────────── */}
            <section className="rounded-[2.5rem] bg-[#0a0c24] border border-white/5 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle accent bar at top */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 opacity-60" />
              
              <div className="space-y-10">
                {/* ── Daily Digest Toggle ────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-violet-600/10 flex items-center justify-center shrink-0">
                      <Bell className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tight">
                        Daily Digest Email
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-md">
                        Receive a daily email with the best job matches based on your profile
                        skills and experience.
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id="daily-digest-toggle"
                    checked={localDigest}
                    onChange={setLocalDigest}
                    disabled={isSaving}
                  />
                </div>

                <div className="h-px bg-white/5" />

                {/* ── Minimum Match Score ─────────────── */}
                <div className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center shrink-0">
                      <Gauge className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-black text-white tracking-tight">
                          Minimum Match Score
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black uppercase tracking-widest ${scoreLabel.color}`}>
                            {scoreLabel.text}
                          </span>
                          <span className="text-2xl font-black text-white tabular-nums">
                            {localScore}
                            <span className="text-sm text-slate-500">%</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 max-w-md">
                        Only jobs with a match score above this threshold will appear in your
                        daily digest. Higher values mean fewer, more relevant results.
                      </p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="px-2">
                    <div className="relative">
                      <input
                        id="min-match-score-slider"
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={localScore}
                        onChange={(e) => setLocalScore(Number(e.target.value))}
                        disabled={isSaving}
                        className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer
                          disabled:cursor-not-allowed disabled:opacity-50
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:h-6
                          [&::-webkit-slider-thumb]:w-6
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-white
                          [&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(139,44,245,0.6)]
                          [&::-webkit-slider-thumb]:border-2
                          [&::-webkit-slider-thumb]:border-violet-500
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-webkit-slider-thumb]:transition-shadow
                          [&::-webkit-slider-thumb]:duration-200
                          [&::-webkit-slider-thumb]:hover:shadow-[0_0_24px_rgba(139,44,245,0.8)]
                          [&::-moz-range-thumb]:h-6
                          [&::-moz-range-thumb]:w-6
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-white
                          [&::-moz-range-thumb]:border-2
                          [&::-moz-range-thumb]:border-violet-500
                          [&::-moz-range-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:shadow-[0_0_16px_rgba(139,44,245,0.6)]
                          [&::-moz-range-track]:bg-transparent
                        "
                        style={{
                          background: `linear-gradient(to right, #8b2cf5 0%, #22d3ee ${localScore}%, rgba(255,255,255,0.05) ${localScore}%)`,
                        }}
                      />
                    </div>

                    {/* Scale markers */}
                    <div className="flex justify-between mt-3 px-1">
                      {[0, 25, 50, 75, 100].map((tick) => (
                        <button
                          key={tick}
                          onClick={() => setLocalScore(tick)}
                          disabled={isSaving}
                          className={`text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:cursor-not-allowed
                            ${localScore >= tick ? "text-slate-300" : "text-slate-600"}
                            hover:text-violet-400
                          `}
                        >
                          {tick}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* ── Action Buttons ──────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Discard */}
                  <AnimatePresence>
                    {isDirty && (
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={handleDiscard}
                        disabled={isSaving}
                        className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        Discard Changes
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4 sm:ml-auto">
                    {/* Save Button */}
                    <button
                      id="save-alert-settings-btn"
                      onClick={handleSave}
                      disabled={!isDirty || isSaving}
                      className={`
                        relative overflow-hidden px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest
                        inline-flex items-center gap-3 transition-all duration-300
                        disabled:cursor-not-allowed
                        ${isDirty
                          ? "btn-glow-primary shadow-[0_0_20px_rgba(139,44,245,0.4)] hover:shadow-[0_0_32px_rgba(139,44,245,0.6)]"
                          : "bg-white/5 text-slate-500 border border-white/5"
                        }
                      `}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Test Email Section ──────────────── */}
            <section className="rounded-[2.5rem] bg-gradient-to-br from-cyan-600/5 via-[#0a0c24] to-violet-600/5 border border-white/5 p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/5 blur-[60px] pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-violet-600/5 blur-[60px] pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-600/15 to-violet-600/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-lg">
                    <Mail className="h-7 w-7 text-cyan-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-3">
                      <Zap className="h-3 w-3" />
                      Instant Preview
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Send Test Alert
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                      Instantly generate and send a sample daily digest to your email with your
                      top matching jobs. Requires a job title in your profile.
                    </p>
                  </div>
                </div>

                <button
                  id="trigger-test-email-btn"
                  onClick={sendTestEmail}
                  disabled={isSendingTest || isSaving}
                  className="btn-glow-accent px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-3 whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* ─── Info Footer ────────────────────── */}
            <div className="flex items-center gap-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <Shield className="h-3.5 w-3.5" />
              <span>
                Your preferences are encrypted and securely stored. You can unsubscribe at any
                time.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
