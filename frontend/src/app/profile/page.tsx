"use client";

import { useState, useTransition, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useUserProfile } from "@/hooks/use-user-profile";
import { EditProfileFormTabs } from "@/features/profile/components/edit-profile-form-tabs";
import { CareerIntelligenceHub } from "@/features/profile/components/career-intelligence-hub";
import type { UpdateProfileRequest } from "@/services/profile.service";
import { escapeHtml } from "@/utils/security/sanitization";
import {
  User, 
  Code2,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  PlusCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfileResponse } from "@/types/profile.types";
import { Button } from "@/components/ui/button";
import { CvUploaderWidget } from "@/features/cv-parser/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// --- Helper Components ---

const ProfileStrengthIndicator = ({ score }: { score: number }) => {
  const strength = useMemo(() => {
    if (score < 40) return { label: "Beginner", color: "text-amber-400" };
    if (score < 75) return { label: "Intermediate", color: "text-sky-400" };
    return { label: "Advanced", color: "text-emerald-400" };
  }, [score]);

  return <span className={`text-xs font-semibold ${strength.color}`}>{strength.label} Profile</span>;
};

const AvailabilityBadge = ({ available }: { available: boolean }) => {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Not Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Open to Work
    </span>
  );
};

const ProfileCompletenessCard = ({
  profile,
  onEdit,
  onOpenCv,
}: {
  profile: UserProfileResponse;
  onEdit: () => void;
  onOpenCv: () => void;
}) => {
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
      { label: "⚡ Auto-fill with AI Resume", action: () => onOpenCv() },
      !checks.hasHeadline && { label: "Add your professional headline", action: () => onEdit() },
      !checks.hasAbout && { label: "Write a brief summary about yourself", action: () => onEdit() },
      !checks.hasExperience && { label: "Set your years of experience", action: () => onEdit() },
      !checks.hasSalary && { label: "Define your expected salary", action: () => onEdit() },
      !checks.hasSkills && { label: "List your top skills", action: () => onEdit() },
    ].filter(Boolean) as { label: string; action: () => void }[];

    return { score, incompleteTasks };
  }, [profile, onEdit, onOpenCv]);

  return (
    <div className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-violet-400" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Market Readiness</h3>
      </div>
      <div className="relative flex items-center justify-center h-36 w-36 mx-auto my-5">
        <svg className="h-full w-full transform -rotate-90">
          <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/[0.05]" />
          <motion.circle
            cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent"
            strokeDasharray={389.5}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 389.5 }}
            animate={{ strokeDashoffset: 389.5 - (389.5 * completeness.score) / 100 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="text-violet-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">{completeness.score}%</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Complete</span>
        </div>
      </div>
      
      {completeness.incompleteTasks.length > 0 ? (
        <div className="mt-auto space-y-3">
          <p className="text-xs font-semibold text-slate-300">Action items to optimize matching:</p>
          <ul className="space-y-1.5">
            {completeness.incompleteTasks.slice(0, 3).map((task, i) => (
              <li key={i}>
                <button onClick={task.action} className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] transition-colors cursor-pointer">
                  <PlusCircle className="h-4 w-4 text-violet-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">{task.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center mt-auto py-2">
          <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">Profile is Ready</h4>
          <p className="text-xs text-slate-400 mt-0.5">You are set for top opportunities.</p>
        </div>
      )}
    </div>
  );
};


export default function ProfilePage() {
  const { profile, isLoading, isSaving, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
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
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-2xl border border-red-500/20 bg-[#0c0f24] p-8 text-center max-w-md">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">Unable to Load Profile</h3>
            <p className="text-slate-400 text-xs mb-5">
              We encountered an issue loading your profile. Please try again.
            </p>
            <button
              onClick={handleRetry}
              className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-colors"
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
      <div className="max-w-6xl xl:max-w-7xl mx-auto space-y-6">
        {isEditing ? (
          <EditProfileFormTabs
            profile={profile}
            isLoading={isSaving}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Header Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 sm:p-7 shadow-sm"
                >
                  <div className="relative flex flex-col sm:flex-row items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/25 to-indigo-600/15 flex items-center justify-center border border-white/[0.08]">
                        <User className="h-9 w-9 text-slate-200" />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <AvailabilityBadge available={!!profile.isOpenToWork} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                          {escapeHtml(profile.username) || "User"}
                        </h1>
                      </div>
                      <p className="text-slate-300 font-medium text-xs sm:text-sm mb-3">
                        {escapeHtml(profile.currentJobTitle) || "No headline provided"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-slate-300 text-[11px]">
                          {profile.city && profile.country ? `${escapeHtml(profile.city)}, ${escapeHtml(profile.country)}` : escapeHtml(profile.country) || escapeHtml(profile.city) || "Location not set"}
                        </span>
                        {profile.email ? (
                          <a
                            href={`mailto:${profile.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-slate-300 hover:text-violet-300 transition-colors text-[11px]"
                          >
                            {profile.email}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-slate-400 text-[11px]">
                            Email not set
                          </span>
                        )}
                      </div>
                      <ProfileStrengthIndicator score={profileCompleteness} />
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCvModalOpen(true)}
                        className="w-full sm:w-auto h-10 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 font-semibold text-xs rounded-xl"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                        Auto-fill with CV
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleEdit}
                        className="w-full sm:w-auto h-10 font-semibold text-xs rounded-xl"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* About Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-violet-400" />
                        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">About</h3>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">Summary</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {escapeHtml(profile.bio) || "No summary provided. Click 'Edit Profile' to add one."}
                    </p>
                  </motion.div>

                  {/* Skills Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-violet-400" />
                        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Skills</h3>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">Tech Stack</span>
                    </div>
                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map(skill => (
                          <span key={skill.id} className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-medium text-slate-200 border border-white/[0.06]">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                       <p className="text-xs text-slate-400">No skills listed. Add your skills to attract recruiters.</p>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Right Sidebar */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="space-y-6"
              >
                <ProfileCompletenessCard
                  profile={profile}
                  onEdit={handleEdit}
                  onOpenCv={() => setIsCvModalOpen(true)}
                />
              </motion.div>
            </div>

            {/* Career Intelligence Hub - Full Width */}
            <CareerIntelligenceHub profile={profile} isLoading={isLoading} />
          </>
        )}

        {/* Modal for CV Upload directly inside profile */}
        <Dialog open={isCvModalOpen} onOpenChange={setIsCvModalOpen}>
          <DialogContent className="max-w-2xl bg-[#0a0c24] border-white/10 text-white max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                AI Resume Auto-fill
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                Upload your resume (PDF) to let AI extract your skills, headline, and experience to auto-fill your profile instantly.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-2">
              <CvUploaderWidget />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
