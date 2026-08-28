"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Zap,
  Brain,
  Award,
  AlertCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import type { UserProfileResponse } from "@/lib/profile/types";

interface CareerIntelligenceProps {
  profile: UserProfileResponse;
  isLoading?: boolean;
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sublabel?: string;
  color: "violet" | "emerald" | "cyan" | "amber";
  delay: number;
}) => {
  const colorMap = {
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border p-4 sm:p-6 backdrop-blur-xl overflow-hidden ${colorMap[color]}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
            {label}
          </span>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-white break-words">{value}</p>
          {sublabel && <p className="text-[11px] sm:text-xs text-slate-400 mt-2 line-clamp-2">{sublabel}</p>}
        </div>
      </div>
    </motion.div>
  );
};

const InsightItem = ({
  icon: Icon,
  title,
  description,
  badges,
  delay,
  isPremium,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badges?: string[];
  delay: number;
  isPremium?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden"
  >
    {isPremium && (
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-transparent" />
    )}
    <div className="relative">
      <div className="flex items-start gap-3 mb-2">
        <div className="mt-1">
          <Icon className="h-4 w-4 text-violet-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            {title}
            {isPremium && (
              <div title="Premium feature — coming soon" className="inline-block">
                <Lock className="h-3 w-3 text-amber-400" />
              </div>
            )}
          </h4>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
      </div>
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {badges.map((badge, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

export const CareerIntelligenceHub = ({
  profile,
  isLoading,
}: CareerIntelligenceProps) => {
  const analysis = useMemo(() => {
    if (!profile) {
      return {
        profileScore: 0,
        marketPosition: "—",
        topSkills: [],
        recommendedRole: "—",
        salaryPotential: "—",
        skillGaps: [],
      };
    }

    // Profile Score: based on completeness + experience + skills
    const skillCount = profile.skills?.length || 0;
    const hasExp = (profile.yearsOfExperience || 0) > 0;
    const hasSalary = !!profile.expectedSalary;
    const hasBio = (profile.bio?.length || 0) > 20;
    const hasTitle = !!profile.currentJobTitle;

    let score = 0;
    if (hasBio) score += 20;
    if (hasExp) score += 20;
    if (skillCount > 0) score += Math.min(skillCount * 5, 20);
    if (hasSalary) score += 20;
    if (hasTitle) score += 20;
    score = Math.min(score, 100);

    // Market Position: derived from years of experience (real profile data)
    const years = profile.yearsOfExperience || 0;
    let position = "Entry-Level";
    if (years >= 3 && years < 6) position = "Mid-Level";
    else if (years >= 6 && years < 10) position = "Senior";
    else if (years >= 10) position = "Lead / Architect";

    // Top Skills (first 5 from real user data)
    const topSkills = profile.skills?.slice(0, 5).map((s) => s.name) || [];

    // Recommended next step: derived from current market position
    const roleMap: Record<string, string> = {
      "Entry-Level": "Build project experience → Target Mid-Level roles",
      "Mid-Level": "Deepen specialization → Target Senior roles",
      Senior: "Develop leadership skills → Target Tech Lead roles",
      "Lead / Architect": "Build strategic impact → Target Staff+ roles",
    };
    const recommendedRole = roleMap[position] || "Explore new opportunities";

    // Salary display: show actual user-set expected salary honestly
    const salaryDisplay = hasSalary
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: profile.currency || "EGP",
          minimumFractionDigits: 0,
        }).format(profile.expectedSalary!)
      : "—";

    // Actionable suggestions based on actual profile gaps
    const gaps: string[] = [];
    if (!hasTitle) gaps.push("Add your professional headline");
    if (skillCount < 3) gaps.push("Add more skills to improve visibility");
    if (!hasExp) gaps.push("Set your years of experience");
    if (!hasBio) gaps.push("Write a compelling professional summary");
    if (!hasSalary) gaps.push("Define your salary expectations");

    return {
      profileScore: score,
      marketPosition: position,
      topSkills,
      recommendedRole,
      salaryDisplay,
      hasSalary,
      skillGaps: gaps,
    };
  }, [profile]);

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-5 w-5 rounded bg-slate-700 animate-pulse" />
          <div className="h-5 w-32 rounded bg-slate-700 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center">
          <Brain className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Career Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Insights calculated from your profile data
          </p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <MetricCard
          icon={Target}
          label="Profile Score"
          value={`${analysis.profileScore}%`}
          sublabel="Profile completeness"
          color="violet"
          delay={0}
        />
        <MetricCard
          icon={TrendingUp}
          label="Market Position"
          value={analysis.marketPosition}
          sublabel={`Based on ${profile.yearsOfExperience || 0} years experience`}
          color="emerald"
          delay={0.1}
        />
        <MetricCard
          icon={Award}
          label="Top Skills"
          value={analysis.topSkills.length > 0 ? analysis.topSkills.slice(0, 2).join(", ") : "—"}
          sublabel={analysis.topSkills.length > 2 ? `+${analysis.topSkills.length - 2} more` : (analysis.topSkills.length === 0 ? "Add skills to your profile" : undefined)}
          color="cyan"
          delay={0.2}
        />
        <MetricCard
          icon={Zap}
          label="Expected Salary"
          value={analysis.salaryDisplay || "—"}
          sublabel={analysis.hasSalary ? `${profile.currency || "EGP"} • Your target` : "Set your salary expectations"}
          color="amber"
          delay={0.3}
        />
      </div>

      {/* Career Path & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Path */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-5">
            <ArrowRight className="h-5 w-5 text-violet-400 shrink-0" />
            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">
              Recommended Next Step
            </h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">{analysis.recommendedRole}</p>
            <div className="flex items-start gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-xs text-violet-300 leading-relaxed">
                Complete your profile to unlock personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-5">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">
              Growth Opportunities
            </h3>
          </div>
          <ul className="space-y-3">
            {analysis.skillGaps.length > 0 ? (
              analysis.skillGaps.map((gap, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-slate-300 rounded-lg border border-white/5 bg-white/[0.03] p-3"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span>{gap}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-emerald-300 font-medium">✓ Your profile is optimized!</p>
            )}
          </ul>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">
          Detailed Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightItem
            icon={Brain}
            title="Profile Strengths"
            description={analysis.topSkills.length > 0
              ? `Your top skills include ${analysis.topSkills.slice(0, 3).join(", ")}. Continue building depth in these areas.`
              : "Add skills to your profile to see personalized strength analysis."
            }
            badges={analysis.topSkills.slice(0, 3)}
            delay={0.4}
          />
          <InsightItem
            icon={Target}
            title="Target Roles"
            description={`Based on your experience level (${analysis.marketPosition}), you can target roles matching your skill set.`}
            badges={[analysis.marketPosition]}
            delay={0.5}
          />
          <InsightItem
            icon={TrendingUp}
            title="Salary Benchmarking"
            description="Real-time salary benchmarking against market data will be available in a future update."
            isPremium
            delay={0.6}
          />
          <InsightItem
            icon={Award}
            title="Certification Suggestions"
            description="Personalized certification recommendations based on your skills will be available soon."
            isPremium
            delay={0.7}
          />
        </div>
      </div>

      {/* Data Source Notice */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          These insights are calculated from your profile data. Features marked with 🔒 will be available in a future update with real market data integration.
        </p>
      </div>
    </motion.div>
  );
};
