"use client";

import { useState, useTransition, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useUserProfile } from "@/hooks/use-user-profile";
import { EditProfileFormTabs } from "@/components/profile/edit-profile-form-tabs";
import { CareerIntelligenceHub } from "@/components/profile/career-intelligence-hub";
import type { UpdateProfileRequest } from "@/lib/profile/profile-service";
import { escapeHtml } from "@/lib/security/sanitization";
import {
  User, 
  Code2,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfileResponse } from "@/lib/profile/types";
import { Button } from "@/components/ui/button";

// --- Helper Components ---

const ProfileStrengthIndicator = ({ score }: { score: number }) => {
  const strength = useMemo(() => {
    if (score < 40) return { label: "Beginner", color: "text-amber-400" };
    if (score < 75) return { label: "Intermediate", color: "text-sky-400" };
    return { label: "Advanced", color: "text-emerald-400" };
  }, [score]);

  return <span className={`text-xs font-bold ${strength.color}`}>{strength.label} Profile</span>;
};

const AvailabilityBadge = ({ available }: { available: boolean }) => {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1 text-[10px] font-bold text-slate-400 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        Not Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Open to Work
    </span>
  );
};

const ProfileCompletenessCard = ({ profile, onEdit }: { profile: UserProfileResponse, onEdit: () => void }) => {
  const completeness = useMemo(() => {
    const checks = {
      hasHeadline: !!profile.currentJobTitle,
      hasAbout: (profile.bio?.length || 0) > 20,
      hasExperience: (profile.yearsOfExperience || 0) > 0,
      hasSalary: !!profile.expectedSalary,
      hasSkills: (profile.skills?.length || 0) > 0,
    };
    const totalChecks = Object.keys(checks).length;
    const completedChecks = Object.values(checks).filter(Boolean).length;
    const score = Math.round((completedChecks / totalChecks) * 100);
    
    const incompleteTasks = [
      !checks.hasHeadline && { label: "Add your professional headline", action: () => onEdit() },
      !checks.hasAbout && { label: "Write a brief summary about yourself", action: () => onEdit() },
      !checks.hasExperience && { label: "Set your years of experience", action: () => onEdit() },
      !checks.hasSalary && { label: "Define your expected salary", action: () => onEdit() },
      !checks.hasSkills && { label: "List your top skills", action: () => onEdit() },
    ].filter(Boolean) as { label: string, action: () => void }[];

    return { score, incompleteTasks };
  }, [profile, onEdit]);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-indigo-950/50 border border-white/10 p-8 backdrop-blur-xl h-full flex flex-col shadow-2xl shadow-violet-500/10">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Market Readiness</h3>
      </div>
      <div className="relative flex items-center justify-center h-40 w-40 mx-auto my-6">
        <svg className="h-full w-full transform -rotate-90 drop-shadow-[0_0_18px_rgba(139,44,245,0.25)]">
          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
          <motion.circle
            cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={439.8}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 439.8 }}
            animate={{ strokeDashoffset: 439.8 - (439.8 * completeness.score) / 100 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="text-violet-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">{completeness.score}%</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Complete</span>
        </div>
      </div>
      
      {completeness.incompleteTasks.length > 0 ? (
        <div className="mt-auto space-y-4">
          <p className="text-center text-sm font-bold text-slate-300">Complete your profile to get better matches:</p>
          <ul className="space-y-2">
            {completeness.incompleteTasks.slice(0, 3).map((task, i) => (
              <li key={i}>
                <button onClick={task.action} className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <PlusCircle className="h-5 w-5 text-violet-400 shrink-0" />
                  <span className="text-xs text-slate-400">{task.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center mt-auto">
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-white">Profile is Ready!</h4>
          <p className="text-xs text-slate-400 mt-1">You are all set. We will notify you about top opportunities.</p>
        </div>
      )}
    </div>
  );
};


export default function ProfilePage() {
  const { profile, isLoading, isSaving, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [, startTransition] = useTransition();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSaveProfile = async (data: UpdateProfileRequest) => {
    await updateProfile(data);
    startTransition(() => {
      setIsEditing(false);
    });
  };

  const handleCancelEdit = () => {
    startTransition(() => {
      setIsEditing(false);
    });
  };

  const handleEdit = () => {
    startTransition(() => {
      setIsEditing(true);
    });
  };

  const profileCompleteness = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      !!profile.currentJobTitle,
      (profile.bio?.length || 0) > 20,
      (profile.yearsOfExperience || 0) > 0,
      !!profile.expectedSalary,
      (profile.skills?.length || 0) > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-violet-500 mx-auto" />
            <p className="text-slate-400">Loading your profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-3xl border border-dashed border-red-500/20 bg-red-500/5 p-12 text-center max-w-md">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Unable to Load Profile</h3>
            <p className="text-slate-400 text-sm mb-6">
              We encountered an issue loading your profile. This might be a temporary network issue. Please try again.
            </p>
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {isEditing ? (
          <EditProfileFormTabs
            profile={profile}
            isLoading={isSaving}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Header Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-indigo-950/40 border border-white/10 p-8 backdrop-blur-xl shadow-2xl shadow-indigo-500/10"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_45%)]" />
                  <div className="relative flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/20 flex items-center justify-center border border-white/10 shadow-[0_0_24px_rgba(99,102,241,0.3)]">
                        <User className="h-10 w-10 text-slate-200" />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <AvailabilityBadge available={!!profile.isOpenToWork} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          {escapeHtml(profile.username) || "User"}
                        </h1>
                      </div>
                      <p className="text-slate-300 font-medium text-sm mb-4">
                        {escapeHtml(profile.currentJobTitle) || "No headline provided"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                          {profile.city && profile.country ? `${escapeHtml(profile.city)}, ${escapeHtml(profile.country)}` : escapeHtml(profile.country) || escapeHtml(profile.city) || "Location not set"}
                        </span>
                        {profile.email ? (
                          <a
                            href={`mailto:${profile.email}`}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 hover:text-violet-300 transition-colors"
                          >
                            {profile.email}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-400">
                            Email not set
                          </span>
                        )}
                      </div>
                      <ProfileStrengthIndicator score={profileCompleteness} />
                    </div>
                    <Button onClick={handleEdit} className="shrink-0 bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </motion.div>

                {/* Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* About Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-3xl bg-slate-950/70 border border-white/10 p-8 backdrop-blur-xl shadow-xl shadow-black/20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-violet-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">About</h3>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Summary</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {escapeHtml(profile.bio) || "No summary provided. Click 'Edit Profile' to add one."}
                    </p>
                  </motion.div>

                  {/* Skills Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-3xl bg-slate-950/70 border border-white/10 p-8 backdrop-blur-xl shadow-xl shadow-black/20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-violet-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Skills</h3>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Top Stack</span>
                    </div>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                          <span key={skill.id} className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-slate-200 border border-white/10 shadow-sm">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                       <p className="text-sm text-slate-400">No skills listed. Add your skills to attract recruiters.</p>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Right Sidebar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-8"
              >
                <ProfileCompletenessCard profile={profile} onEdit={handleEdit} />
              </motion.div>
            </div>

            {/* Career Intelligence Hub - Full Width */}
            <CareerIntelligenceHub profile={profile} isLoading={isLoading} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
