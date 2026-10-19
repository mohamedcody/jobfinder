"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useEmailAlerts } from "@/hooks/use-email-alerts";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2.5">
        <div className="h-8 w-60 bg-white/5 rounded-xl" />
        <div className="h-4 w-80 bg-white/5 rounded-lg" />
      </div>
      {/* Card skeleton */}
      <div className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 sm:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-44 bg-white/5 rounded-lg" />
            <div className="h-3.5 w-64 bg-white/5 rounded-lg" />
          </div>
          <div className="h-7 w-12 bg-white/5 rounded-full" />
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="space-y-3">
          <div className="h-5 w-52 bg-white/5 rounded-lg" />
          <div className="h-3 w-full bg-white/5 rounded-full" />
          <div className="h-3 w-28 bg-white/5 rounded-lg" />
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="flex justify-end gap-3">
          <div className="h-11 w-32 bg-white/5 rounded-xl" />
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
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked
          ? "bg-violet-600 shadow-sm shadow-violet-600/30"
          : "bg-white/[0.1] border border-white/[0.08]"
        }
      `}
    >
      <span
        className={`
          pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm
          transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

/* ─── Score Label Utility ────────────────────────── */
function getScoreLabel(score: number): { text: string; color: string; description: string } {
  if (score <= 20) return { text: "Very Broad", color: "text-rose-400", description: "Minimal filtering — catches entry-level and tangentially related roles." };
  if (score <= 40) return { text: "Broad", color: "text-amber-400", description: "Wide net — delivers roles with partial tech stack overlap." };
  if (score <= 60) return { text: "Balanced", color: "text-cyan-400", description: "Recommended default — balanced mix of relevance and opportunity volume." };
  if (score <= 80) return { text: "Selective", color: "text-emerald-400", description: "Strict matching — focuses primarily on your core technologies and experience." };
  return { text: "Highly Selective", color: "text-violet-400", description: "Maximum precision — alerts only for roles strongly aligning with your exact profile." };
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync server state → local state when settings load
  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalDigest(settings.dailyDigestEnabled);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalScore(settings.minMatchScore);
    }
  }, [settings]);

  // Dirty detection (Derived during render + side effect safely)
  const isDirty = settings ? (localDigest !== settings.dailyDigestEnabled || localScore !== settings.minMatchScore) : false;
  
  useEffect(() => {
    if (isDirty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaveSuccess(false);
    }
  }, [isDirty]);

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
      toast.info("Changes discarded");
    }
  }, [settings]);

  const scoreLabel = getScoreLabel(localScore);

  // Error state with retry
  if (error && !settings) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto py-12">
          <Alert variant="danger" className="p-8 text-center flex flex-col items-center">
            <AlertTitle className="text-xl font-bold mb-2">Failed to Load Settings</AlertTitle>
            <AlertDescription className="text-sm max-w-md mx-auto mb-5 text-slate-300">
              {error}
            </AlertDescription>
            <Button
              onClick={fetchSettings}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* ─── Page Header ─────────────────────────── */}
            <section className="relative overflow-hidden rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 sm:p-8 shadow-sm">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Settings className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300 mb-2">
                    <Sparkles className="h-3 w-3" />
                    Notification Preferences
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Email Alert Settings
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
                    Configure your daily job-matching digest. We&apos;ll send curated roles that
                    match your profile above your quality threshold.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Main Settings Card ─────────────────── */}
            <section className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 sm:p-8 shadow-sm relative">
              <div className="space-y-8">
                {/* ── Daily Digest Toggle ────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center shrink-0">
                      <Bell className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Daily Digest Email
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-md leading-relaxed">
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

                <div className="h-px bg-white/[0.06]" />

                {/* ── Minimum Match Score ─────────────── */}
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-cyan-600/10 flex items-center justify-center shrink-0">
                      <Gauge className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Minimum Match Score
                        </h3>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs font-semibold ${scoreLabel.color}`}>
                            {scoreLabel.text}
                          </span>
                          <span className="text-xl font-bold text-white tabular-nums">
                            {localScore}
                            <span className="text-xs text-slate-500 font-normal">%</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                        Only jobs with a match score above this threshold will appear in your
                        daily digest.
                      </p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="px-1 pt-2">
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
                        className="w-full h-2 bg-white/[0.08] rounded-full appearance-none cursor-pointer
                          disabled:cursor-not-allowed disabled:opacity-50
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:w-5
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-white
                          [&::-webkit-slider-thumb]:shadow-md
                          [&::-webkit-slider-thumb]:border-2
                          [&::-webkit-slider-thumb]:border-violet-500
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:h-5
                          [&::-moz-range-thumb]:w-5
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-white
                          [&::-moz-range-thumb]:border-2
                          [&::-moz-range-thumb]:border-violet-500
                          [&::-moz-range-thumb]:cursor-pointer
                          [&::-moz-range-track]:bg-transparent
                        "
                        style={{
                          background: `linear-gradient(to right, #7c3aed 0%, #06b6d4 ${localScore}%, rgba(255,255,255,0.08) ${localScore}%)`,
                        }}
                      />
                    </div>

                    {/* Scale markers */}
                    <div className="flex justify-between mt-2 px-1">
                      {[0, 25, 50, 75, 100].map((tick) => (
                        <button
                          key={tick}
                          onClick={() => setLocalScore(tick)}
                          disabled={isSaving}
                          className={`text-[11px] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed
                            ${localScore >= tick ? "text-slate-300" : "text-slate-500"}
                            hover:text-violet-400
                          `}
                        >
                          {tick}%
                        </button>
                      ))}
                    </div>

                    {/* Behavioral explanation note */}
                    <div className="mt-3.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-white">Digest behavior:</span> {scoreLabel.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* ── Action Buttons ──────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  {/* Discard */}
                  <AnimatePresence>
                    {isDirty && (
                      <motion.button
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        onClick={handleDiscard}
                        disabled={isSaving}
                        className="text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50 text-left cursor-pointer"
                      >
                        Discard Changes
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3 sm:ml-auto">
                    {/* Save Button */}
                    <Button
                      id="save-alert-settings-btn"
                      onClick={handleSave}
                      disabled={!isDirty || isSaving}
                      isLoading={isSaving}
                      loadingText="Saving..."
                      variant={isDirty ? "primary" : "secondary"}
                      className="h-11 px-6 text-xs font-semibold gap-2 shadow-sm"
                    >
                      {saveSuccess ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-3.5 w-3.5" />
                          <span>Save Settings</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Test Email Section ──────────────── */}
            <section className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 sm:p-8 shadow-sm relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 mb-1.5">
                      <Zap className="h-3 w-3" />
                      Instant Preview
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Send Test Alert
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md leading-relaxed">
                      Instantly generate and send a sample daily digest to your email with your
                      top matching jobs. Requires a job title in your profile.
                    </p>
                  </div>
                </div>

                <Button
                  id="trigger-test-email-btn"
                  onClick={sendTestEmail}
                  disabled={isSendingTest || isSaving}
                  isLoading={isSendingTest}
                  loadingText="Sending..."
                  variant="accent"
                  className="h-11 px-5 text-xs font-semibold gap-2 whitespace-nowrap shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Test Email</span>
                </Button>
              </div>
            </section>

            {/* ─── Info Footer ────────────────────── */}
            <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Your preferences are securely stored. You can unsubscribe at any time.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
