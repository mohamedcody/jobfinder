"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle,
  Briefcase,
  GraduationCap,
  Code2,
  X,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CvParseResponse } from "@/lib/cv-parser/types";

interface ReviewAndSaveFormProps {
  result: CvParseResponse;
  onReset: () => void;
}

/**
 * Displays AI-extracted CV data for user review and editing before final save.
 * Users can add/remove skills, edit education, and modify experience entries.
 */
export function ReviewAndSaveForm({ result, onReset }: ReviewAndSaveFormProps) {
  // Editable state seeded from AI result
  const [skills, setSkills] = useState<string[]>(result.extractedSkills || []);
  const [newSkill, setNewSkill] = useState("");
  const [jobTitle, setJobTitle] = useState(result.currentJobTitle || "");
  const [bio, setBio] = useState(result.bio || "");
  const [educationLevel, setEducationLevel] = useState(result.educationLevel || "");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">(
    result.yearsOfExperience ?? "",
  );
  const [city, setCity] = useState(result.city || "");
  const [country, setCountry] = useState(result.country || "");

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Skill already exists.");
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Success Header */}
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-5">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            CV Parsed Successfully!
          </h3>
          <p className="text-xs text-slate-400">
            Review the extracted data below. Edit anything before it&apos;s saved to
            your profile.
          </p>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">
        <SectionHeader icon={Briefcase} label="Profile Overview" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Job Title"
            value={jobTitle}
            onChange={setJobTitle}
            placeholder="e.g. Backend Developer"
          />
          <FieldInput
            label="Education Level"
            value={educationLevel}
            onChange={setEducationLevel}
            placeholder="e.g. Bachelor's"
          />
          <FieldInput
            label="Years of Experience"
            type="number"
            value={String(yearsOfExperience)}
            onChange={(v) =>
              setYearsOfExperience(v === "" ? "" : parseInt(v, 10) || 0)
            }
            placeholder="e.g. 3"
          />
          <div className="flex gap-3">
            <FieldInput
              label="City"
              value={city}
              onChange={setCity}
              placeholder="e.g. Cairo"
            />
            <FieldInput
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="e.g. Egypt"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Professional Summary
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full field-input rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
            placeholder="A brief professional summary..."
          />
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <SectionHeader
          icon={Code2}
          label="Skills"
          badge={`${skills.length} extracted`}
        />

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <motion.span
              key={`${skill}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 px-3 py-1.5 text-xs font-semibold text-violet-300"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(i)}
                className="h-4 w-4 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-2.5 w-2.5 text-slate-400 group-hover:text-red-300" />
              </button>
            </motion.span>
          ))}
        </div>

        {/* Add skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a skill..."
            className="flex-1 field-input rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          />
          <Button
            type="button"
            onClick={handleAddSkill}
            size="sm"
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Education & Experience Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Education Entries"
          value={result.educationCount}
          color="cyan"
        />
        <StatCard
          icon={Building2}
          label="Work Experience Entries"
          value={result.workExperienceCount}
          color="violet"
        />
      </div>

      {/* Parse Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-violet-400" />
          Parsed by AI •{" "}
          {result.parsedAt
            ? new Date(result.parsedAt).toLocaleString()
            : "Just now"}
        </span>
        {result.fullName && (
          <span className="text-slate-400">
            Detected name:{" "}
            <strong className="text-slate-300">{result.fullName}</strong>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={onReset}
          variant="ghost"
          className="text-slate-400 hover:text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Upload Another CV
        </Button>
      </div>
    </motion.div>
  );
}

// --- Sub-components ---

function SectionHeader({
  icon: Icon,
  label,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-violet-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em]">
          {label}
        </h4>
      </div>
      {badge && (
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2.5 py-0.5">
          {badge}
        </span>
      )}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full field-input rounded-xl px-4 py-2.5 text-sm focus:outline-none"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "cyan" | "violet";
}) {
  const colors = {
    cyan: {
      bg: "bg-cyan-500/8",
      border: "border-cyan-500/20",
      icon: "bg-cyan-500/15 text-cyan-400",
      value: "text-cyan-300",
    },
    violet: {
      bg: "bg-violet-500/8",
      border: "border-violet-500/20",
      icon: "bg-violet-500/15 text-violet-400",
      value: "text-violet-300",
    },
  };
  const c = colors[color];

  return (
    <div
      className={`rounded-xl ${c.bg} border ${c.border} p-4 flex items-center gap-4`}
    >
      <div
        className={`h-10 w-10 rounded-lg ${c.icon} flex items-center justify-center shrink-0`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-2xl font-black ${c.value}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
