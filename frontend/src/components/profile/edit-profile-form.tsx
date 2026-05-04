"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, MapPin, Zap, Save, X, Loader2 } from "lucide-react";
import type { UserProfileResponse, UpdateProfileRequest } from "@/lib/profile/profile-service";
import { Button } from "@/components/ui/button";

interface EditProfileFormProps {
  profile: UserProfileResponse;
  isLoading?: boolean;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
  onCancel?: () => void;
}

export function EditProfileForm({
  profile,
  isLoading = false,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    currentJobTitle: profile.currentJobTitle || "",
    yearsOfExperience: profile.yearsOfExperience || 0,
    educationLevel: profile.educationLevel || "",
    country: profile.country || "",
    city: profile.city || "",
    expectedSalary: profile.expectedSalary || 0,
    currency: profile.currency || "USD",
    bio: profile.bio || "",
    isOpenToWork: profile.isOpenToWork ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl bg-white/3 border border-white/5 p-8 backdrop-blur-xl"
    >
      <h2 className="text-2xl font-black text-white">Edit Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <Briefcase className="h-4 w-4 text-violet-400" />
            Current Job Title
          </label>
          <input
            type="text"
            name="currentJobTitle"
            value={formData.currentJobTitle || ""}
            onChange={handleChange}
            placeholder="e.g., Senior Backend Engineer"
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 transition-colors"
          />
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <Zap className="h-4 w-4 text-cyan-400" />
            Years of Experience
          </label>
          <input
            type="number"
            name="yearsOfExperience"
            min="0"
            max="60"
            value={formData.yearsOfExperience || 0}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>

        {/* Education Level */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            Education Level
          </label>
          <select
            name="educationLevel"
            value={formData.educationLevel || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
          >
            <option value="">Select Education Level</option>
            <option value="High School">High School</option>
            <option value="Bachelors">Bachelor&apos;s Degree</option>
            <option value="Masters">Master&apos;s Degree</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <MapPin className="h-4 w-4 text-blue-400" />
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country || ""}
            onChange={handleChange}
            placeholder="e.g., Egypt"
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <MapPin className="h-4 w-4 text-red-400" />
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder="e.g., Cairo"
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/40 transition-colors"
          />
        </div>

        {/* Expected Salary */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            💰 Expected Salary
          </label>
          <input
            type="number"
            name="expectedSalary"
            min="0"
            value={formData.expectedSalary || 0}
            onChange={handleChange}
            placeholder="0"
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/40 transition-colors"
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300">Currency</label>
          <select
            name="currency"
            value={formData.currency || "USD"}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500/40 transition-colors"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="EGP">EGP</option>
            <option value="GBP">GBP</option>
            <option value="SAR">SAR</option>
            <option value="AED">AED</option>
          </select>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-300">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ""}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          rows={4}
          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 transition-colors resize-none"
        />
      </div>

      {/* Open to Work Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/2 border border-white/5">
        <input
          type="checkbox"
          name="isOpenToWork"
          checked={formData.isOpenToWork ?? true}
          onChange={handleChange}
          className="w-4 h-4 rounded cursor-pointer"
        />
        <label className="text-sm font-bold text-slate-300 cursor-pointer flex-1">
          I&apos;m open to job opportunities
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSaving || isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl px-6 py-3 transition-colors border border-white/10"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}



