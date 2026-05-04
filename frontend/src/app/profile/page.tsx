"use client";

import { useState, useTransition } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useUserProfile } from "@/hooks/use-user-profile";
import { EditProfileFormTabs } from "@/components/profile/edit-profile-form-tabs";
import { ProfileBadges } from "@/components/profile/profile-badges";
import type { UpdateProfileRequest } from "@/lib/profile/profile-service";
import { 
  User, 
  Mail, 
  Code2, 
  Zap,
  Edit3,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfileResponse } from "@/lib/profile/profile-service";

const MatchGauge = ({ score }: { score: number }) => (
  <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
    <svg className="h-full w-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(139,44,245,0.2)]">
      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
      <motion.circle
        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
        strokeDasharray={439.8}
        initial={{ strokeDashoffset: 439.8 }}
        animate={{ strokeDashoffset: 439.8 - (439.8 * score) / 100 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="text-violet-500"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-3xl font-black text-white">{score}%</span>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Readiness</span>
    </div>
  </div>
);

export default function ProfilePage() {
  const { profile, isLoading, isSaving, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-red-400 font-bold">Profile not found</p>
            <p className="text-slate-400 text-sm">Trying to create your profile automatically...</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {isEditing ? (
          <EditProfileFormTabs
            profile={profile}
            isLoading={isSaving}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            {/* Header Section: Identity Banner */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0c24] border border-white/5 p-8 sm:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-violet-600/10 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative h-32 w-32 rounded-[2.2rem] bg-[#07091a] border border-white/10 flex items-center justify-center overflow-hidden">
                    <User className="h-16 w-16 text-slate-400" />
                    <div className="absolute inset-0 bg-linear-to-tr from-violet-600/20 to-transparent" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white border-4 border-[#0a0c24] shadow-xl">
                    {profile.isOpenToWork ? (
                      <Zap className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-black">🔒</span>
                    )}
                  </div>
                </div>

                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <h1 className="text-4xl font-black text-white tracking-tight">{profile.username}</h1>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      profile.isOpenToWork 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                        : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                    }`}>
                      {profile.isOpenToWork ? "Open to Work" : "Not Available"}
                    </span>
                  </div>

                  {/* Trust Badges */}
                  <div className="mb-4 flex justify-center md:justify-start">
                    <ProfileBadges 
                      isOpenToWork={profile.isOpenToWork}
                      yearsOfExperience={profile.yearsOfExperience}
                    />
                  </div>

                  <p className="text-lg font-medium text-slate-400 mb-6 flex items-center justify-center md:justify-start gap-2">
                    {profile.currentJobTitle || "Professional"} 
                    <span className="h-1 w-1 rounded-full bg-slate-700" /> 
                    {profile.city && profile.country ? `${profile.city}, ${profile.country}` : "Location not set"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <Mail className="h-4 w-4 text-violet-400" /> {profile.email}
                    </div>
                    {profile.resumeUrl && (
                      <a 
                        href={profile.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-violet-500/40 transition-colors"
                      >
                        📄 Resume <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="hidden lg:flex items-center gap-2 bg-violet-600/20 border border-violet-500/40 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-violet-600/30 transition-all text-violet-300"
                >
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
              </div>
            </section>
          </>
        )}

        {!isEditing && (
          <>
            {/* Bento Grid: Core Data */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Profile Info Cards */}
              <section className="lg:col-span-8 space-y-4">
                {/* Experience & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/3 border border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="h-5 w-5 text-cyan-400" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Experience</p>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {profile.yearsOfExperience ?? 0} <span className="text-sm text-slate-400">years</span>
                    </p>
                    {profile.educationLevel && (
                      <p className="text-xs text-slate-400 mt-2">📚 {profile.educationLevel}</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white/3 border border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Code2 className="h-5 w-5 text-violet-400" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Expected Salary</p>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {profile.expectedSalary ? `${profile.expectedSalary.toLocaleString()}` : "Not set"} 
                      <span className="text-sm text-slate-400 ml-2">{profile.currency || "USD"}</span>
                    </p>
                  </div>
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="rounded-2xl bg-white/3 border border-white/5 p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">About</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Last Updated */}
                {profile.updatedAt && (
                  <div className="rounded-2xl bg-white/3 border border-white/5 p-4 flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-500">
                      Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </section>

              {/* Readiness Card - Compact & Visual */}
              <section className="lg:col-span-4 rounded-[2.5rem] bg-linear-to-br from-violet-600/10 to-transparent border border-violet-500/10 p-8 text-center flex flex-col justify-center items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-8">Market Readiness</h3>
                <MatchGauge score={calculateReadiness(profile)} />
                <div className="mt-8 space-y-2">
                  <p className="text-sm font-bold text-white">Profile Complete</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Keep your profile updated for better opportunities.</p>
                </div>
              </section>

              {/* Mobile Edit Button */}
              <div className="lg:hidden lg:col-span-12">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl px-6 py-3 transition-colors"
                >
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

// Helper function to calculate profile readiness
function calculateReadiness(profile: UserProfileResponse): number {
  let score = 50; // Base score

  if (profile.currentJobTitle) score += 10;
  if (profile.yearsOfExperience) score += 10;
  if (profile.educationLevel) score += 10;
  if (profile.city && profile.country) score += 10;
  if (profile.resumeUrl) score += 10;
  if (profile.bio && profile.bio.length > 50) score += 10;
  if (profile.expectedSalary) score += 5;

  return Math.min(score, 100); // Cap at 100
}

