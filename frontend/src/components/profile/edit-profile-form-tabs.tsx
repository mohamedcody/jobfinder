"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { UserProfileResponse, UpdateProfileRequest } from "@/lib/profile/profile-service";
import { Button } from "@/components/ui/button";
import { validators, fieldHints, type ValidationResult } from "@/lib/profile/validation";
import { FieldHelp } from "./contextual-help";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";

interface EditProfileFormTabsProps {
  profile: UserProfileResponse;
  isLoading?: boolean;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
  onCancel?: () => void;
}

type TabType = "basic" | "professional" | "preferences";

export function EditProfileFormTabs({
  profile,
  isLoading = false,
  onSave,
  onCancel,
}: EditProfileFormTabsProps) {
  const [currentTab, setCurrentTab] = useState<TabType>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const [validation, setValidation] = useState<Record<string, ValidationResult>>({});

  // Track if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    const newValue =
      type === "number"
        ? value === ""
          ? 0
          : Number(value)
        : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate field in real-time
    validateField(name, newValue);
  };

  const validateField = (fieldName: string, value: string | number | boolean): void => {
    let result: ValidationResult = { isValid: true };

    switch (fieldName) {
      case "currentJobTitle":
        result = validators.jobTitle(String(value));
        break;
      case "yearsOfExperience":
        result = validators.yearsOfExperience(Number(value));
        break;
      case "expectedSalary":
        result = validators.salary(Number(value));
        break;
      case "bio":
        result = validators.bio(String(value));
        break;
    }

    setValidation((prev) => ({
      ...prev,
      [fieldName]: result,
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

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onCancel?.();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    onCancel?.();
  };

  const tabClasses = (tab: TabType) =>
    `px-4 py-2 font-bold transition-all text-sm whitespace-nowrap ${
      currentTab === tab
        ? "text-white border-b-2 border-violet-500"
        : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent"
    }`;

  const fieldWrapperClasses =
    "space-y-2 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors";

  const inputClasses =
    "w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 transition-colors";

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 rounded-3xl bg-white/3 border border-white/5 p-8 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Edit Profile</h2>
          {hasChanges && (
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved Changes
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 -mx-8 px-8">
          <button
            type="button"
            onClick={() => setCurrentTab("basic")}
            className={tabClasses("basic")}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab("professional")}
            className={tabClasses("professional")}
          >
            Professional
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab("preferences")}
            className={tabClasses("preferences")}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content with Animation */}
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 min-h-[300px]"
        >
          {/* BASIC INFO TAB */}
          {currentTab === "basic" && (
            <div className="space-y-4">
              <div className={fieldWrapperClasses}>
                <FieldHelp
                  label="Current Job Title"
                  help={fieldHints.currentJobTitle}
                />
                <div className="relative">
                  <input
                    type="text"
                    name="currentJobTitle"
                    value={formData.currentJobTitle || ""}
                    onChange={handleChange}
                    placeholder="e.g., Senior Java Developer"
                    className={inputClasses}
                  />
                  {validation.currentJobTitle && (
                    <div
                      className={`absolute right-3 top-2.5 ${
                        validation.currentJobTitle.isValid
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {validation.currentJobTitle.isValid ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </div>
                {validation.currentJobTitle?.message && (
                  <p
                    className={`text-xs ${
                      validation.currentJobTitle.isValid
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {validation.currentJobTitle.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={fieldWrapperClasses}>
                  <FieldHelp
                    label="Country"
                    help={fieldHints.country}
                  />
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    placeholder="e.g., Egypt"
                    className={inputClasses}
                  />
                </div>

                <div className={fieldWrapperClasses}>
                  <FieldHelp label="City" help={fieldHints.city} />
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    placeholder="e.g., Cairo"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className={fieldWrapperClasses}>
                <FieldHelp label="Bio" help={fieldHints.bio} />
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself... (min 10, max 1000 characters)"
                  rows={5}
                  className={`${inputClasses} resize-none`}
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{(formData.bio || "").length}/1000 characters</span>
                  {validation.bio?.message && (
                    <span
                      className={`${
                        validation.bio.isValid ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {validation.bio.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONAL TAB */}
          {currentTab === "professional" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={fieldWrapperClasses}>
                  <FieldHelp
                    label="Years of Experience"
                    help={fieldHints.yearsOfExperience}
                  />
                  <div className="relative">
                    <input
                      type="number"
                      name="yearsOfExperience"
                      min="0"
                      max="60"
                      value={formData.yearsOfExperience || 0}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                    {validation.yearsOfExperience && (
                      <div
                        className={`absolute right-3 top-2.5 ${
                          validation.yearsOfExperience.isValid
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {validation.yearsOfExperience.isValid ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={fieldWrapperClasses}>
                  <FieldHelp
                    label="Education Level"
                    help={fieldHints.educationLevel}
                  />
                  <select
                    name="educationLevel"
                    value={formData.educationLevel || ""}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelors">Bachelor&apos;s Degree</option>
                    <option value="Masters">Master&apos;s Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              {/* Salary Section with linked inputs */}
              <div className="space-y-2 p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
                <label className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                  💰 Expected Salary
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <input
                        type="number"
                        name="expectedSalary"
                        min="0"
                        value={formData.expectedSalary || 0}
                        onChange={handleChange}
                        placeholder="e.g., 5000"
                        className={`${inputClasses} pr-10`}
                      />
                      {validation.expectedSalary && (
                        <div
                          className={`absolute right-3 top-2.5 ${
                            validation.expectedSalary.isValid
                              ? "text-emerald-400"
                              : "text-orange-400"
                          }`}
                        >
                          {validation.expectedSalary.isValid ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <select
                    name="currency"
                    value={formData.currency || "USD"}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="EGP">EGP</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <p className="text-xs text-slate-400">
                  Currency and amount are visually linked for clarity
                </p>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {currentTab === "preferences" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/10 transition-colors">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isOpenToWork"
                    checked={formData.isOpenToWork ?? true}
                    onChange={handleChange}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">
                      Open to Job Opportunities
                    </div>
                    <div className="text-xs text-slate-400">
                      Let employers know you&apos;re looking for new opportunities
                    </div>
                  </div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20">
                <div className="space-y-2 text-xs text-slate-400">
                  <p>
                    <strong>Profile Completion:</strong> Complete more fields to improve
                    your visibility in searches
                  </p>
                  <p>
                    <strong>Market Readiness:</strong> Calculated based on profile
                    completeness, experience, and verification status
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-white/10">
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
              onClick={handleCancelClick}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl px-6 py-3 transition-colors border border-white/10"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </motion.form>

      <UnsavedChangesDialog
        isOpen={showConfirmDialog}
        hasChanges={hasChanges}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}

