"use client";

import { motion } from "framer-motion";
import type { UserProfileResponse } from "@/lib/profile/profile-service";

interface ResponsiveProfileCardProps {
  profile: UserProfileResponse;
  onEditClick: () => void;
}

/**
 * Mobile-optimized profile card with thumb-friendly touch targets
 * Ensures all buttons and interactive elements are minimum 44px for accessibility
 */
export function ResponsiveProfileCard({
  profile,
  onEditClick,
}: ResponsiveProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl bg-white/2 border border-white/5 p-4 sm:p-6 backdrop-blur-xl space-y-4"
    >
      {/* Mobile Edit Button - Always Accessible */}
      <div className="flex lg:hidden">
        <button
          onClick={onEditClick}
          className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            About
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed break-words">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {profile.yearsOfExperience !== null && profile.yearsOfExperience !== undefined && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 font-bold mb-1">Experience</p>
            <p className="text-lg font-bold text-white">
              {profile.yearsOfExperience}+ years
            </p>
          </div>

          {profile.educationLevel && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 font-bold mb-1">Education</p>
              <p className="text-sm font-bold text-white truncate">
                {profile.educationLevel}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Salary Section */}
      {profile.expectedSalary && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-xs text-yellow-400 font-bold mb-1">
            Expected Salary
          </p>
          <p className="text-xl font-bold text-yellow-300">
            {profile.expectedSalary.toLocaleString()} {profile.currency}
          </p>
        </div>
      )}

      {/* Location Section */}
      {(profile.country || profile.city) && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-slate-400 font-bold mb-1">Location</p>
          <p className="text-sm font-bold text-white">
            {[profile.city, profile.country].filter(Boolean).join(", ") || "Not specified"}
          </p>
        </div>
      )}
    </motion.div>
  );
}

