"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Building2,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CvParseResponse,
  CvConfirmRequest,
  CvSkillEntry,
  CvEducationEntry,
  CvWorkExperienceEntry,
} from "@/types/cv-parser.types";

interface ReviewAndSaveFormProps {
  result: CvParseResponse;
  onReset: () => void;
  onConfirm: (request: CvConfirmRequest) => Promise<boolean>;
  isConfirming: boolean;
}

/**
 * Displays AI-extracted CV data for user review and editing before final save.
 * Users can add/remove skills, edit education, and modify experience entries.
 *
 * IMPORTANT: This form does NOT save anything by itself.
 * It builds a CvConfirmRequest and delegates to onConfirm().
 */
export function ReviewAndSaveForm({ result, onReset, onConfirm, isConfirming }: ReviewAndSaveFormProps) {
  const router = useRouter();

  // ─── Flat profile fields ───────────────────────────────────────────
  const [jobTitle, setJobTitle] = useState(result.currentJobTitle || "");
  const [bio, setBio] = useState(result.bio || "");
  const [educationLevel, setEducationLevel] = useState(result.educationLevel || "");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">(
    result.yearsOfExperience ?? "",
  );
  const [city, setCity] = useState(result.city || "");
  const [country, setCountry] = useState(result.country || "");

  // ─── Skills (name + proficiency + years) ───────────────────────────
  const [skills, setSkills] = useState<CvSkillEntry[]>(result.skills || []);
  const [newSkill, setNewSkill] = useState("");

  // ─── Education entries ─────────────────────────────────────────────
  const [education, setEducation] = useState<CvEducationEntry[]>(result.education || []);

  // ─── Work Experience entries ───────────────────────────────────────
  const [workExperience, setWorkExperience] = useState<CvWorkExperienceEntry[]>(result.workExperience || []);

  // ─── Skill handlers ────────────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Skill already exists.");
      return;
    }
    setSkills([...skills, { name: trimmed, proficiencyScore: 3, yearsOfExperience: null }]);
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

  // ─── Education handlers ────────────────────────────────────────────
  const handleUpdateEducation = (index: number, field: keyof CvEducationEntry, value: string | number | null) => {
    setEducation(education.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducation([...education, { institution: "", degree: "", fieldOfStudy: "", startYear: null, endYear: null, grade: null }]);
  };

  // ─── Work Experience handlers ──────────────────────────────────────
  const handleUpdateWorkExp = (index: number, field: keyof CvWorkExperienceEntry, value: string | boolean | null) => {
    setWorkExperience(workExperience.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleRemoveWorkExp = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const handleAddWorkExp = () => {
    setWorkExperience([...workExperience, { companyName: "", jobTitle: "", description: "", startDate: null, endDate: null, isCurrent: false }]);
  };

  // ─── Save handler — builds CvConfirmRequest and delegates ──────────
  const handleSave = async () => {
    const request: CvConfirmRequest = {
      currentJobTitle: jobTitle || null,
      bio: bio || null,
      educationLevel: educationLevel || null,
      yearsOfExperience: yearsOfExperience === "" ? null : yearsOfExperience,
      city: city || null,
      country: country || null,
      skills: skills.filter((s) => s.name.trim() !== ""),
      education: education.filter((e) => e.institution?.trim() || e.degree?.trim()),
      workExperience: workExperience.filter((w) => w.companyName?.trim() || w.jobTitle?.trim()),
    };

    const success = await onConfirm(request);
    if (success) {
      router.push("/profile");
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
            Review the extracted data below. Edit anything before saving to
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
              key={`${skill.name}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 px-3 py-1.5 text-xs font-semibold text-violet-300"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => handleRemoveSkill(i)}
                className="h-4 w-4 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                aria-label={`Remove ${skill.name}`}
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

      {/* Education */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <SectionHeader
          icon={GraduationCap}
          label="Education"
          badge={`${education.length} entries`}
        />

        {education.map((edu, i) => (
          <div key={i} className="rounded-xl bg-white/3 border border-white/8 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entry {i + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveEducation(i)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                aria-label="Remove education entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldInput label="Institution" value={edu.institution || ""} onChange={(v) => handleUpdateEducation(i, "institution", v)} placeholder="e.g. Cairo University" />
              <FieldInput label="Degree" value={edu.degree || ""} onChange={(v) => handleUpdateEducation(i, "degree", v)} placeholder="e.g. Bachelor of Science" />
              <FieldInput label="Field of Study" value={edu.fieldOfStudy || ""} onChange={(v) => handleUpdateEducation(i, "fieldOfStudy", v)} placeholder="e.g. Computer Science" />
              <FieldInput label="Grade" value={edu.grade || ""} onChange={(v) => handleUpdateEducation(i, "grade", v)} placeholder="e.g. Excellent" />
              <FieldInput label="Start Year" type="number" value={edu.startYear != null ? String(edu.startYear) : ""} onChange={(v) => handleUpdateEducation(i, "startYear", v === "" ? null : parseInt(v, 10))} placeholder="e.g. 2017" />
              <FieldInput label="End Year" type="number" value={edu.endYear != null ? String(edu.endYear) : ""} onChange={(v) => handleUpdateEducation(i, "endYear", v === "" ? null : parseInt(v, 10))} placeholder="e.g. 2021" />
            </div>
          </div>
        ))}

        <Button type="button" onClick={handleAddEducation} size="sm" className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl px-4">
          <Plus className="h-4 w-4 mr-1.5" /> Add Education
        </Button>
      </div>

      {/* Work Experience */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
        <SectionHeader
          icon={Building2}
          label="Work Experience"
          badge={`${workExperience.length} entries`}
        />

        {workExperience.map((exp, i) => (
          <div key={i} className="rounded-xl bg-white/3 border border-white/8 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entry {i + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveWorkExp(i)}
                className="text-slate-500 hover:text-red-400 transition-colors"
                aria-label="Remove work experience entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldInput label="Company" value={exp.companyName || ""} onChange={(v) => handleUpdateWorkExp(i, "companyName", v)} placeholder="e.g. Google" />
              <FieldInput label="Job Title" value={exp.jobTitle || ""} onChange={(v) => handleUpdateWorkExp(i, "jobTitle", v)} placeholder="e.g. Software Engineer" />
              <FieldInput label="Start Date" value={exp.startDate || ""} onChange={(v) => handleUpdateWorkExp(i, "startDate", v || null)} placeholder="YYYY-MM" />
              <FieldInput label="End Date" value={exp.endDate || ""} onChange={(v) => handleUpdateWorkExp(i, "endDate", v || null)} placeholder="YYYY-MM" />
            </div>
            <textarea
              value={exp.description || ""}
              onChange={(e) => handleUpdateWorkExp(i, "description", e.target.value)}
              rows={2}
              className="w-full field-input rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
              placeholder="Brief description of your role..."
            />
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={exp.isCurrent}
                onChange={(e) => handleUpdateWorkExp(i, "isCurrent", e.target.checked)}
                className="rounded border-white/20 bg-white/5"
              />
              I currently work here
            </label>
          </div>
        ))}

        <Button type="button" onClick={handleAddWorkExp} size="sm" className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-xl px-4">
          <Plus className="h-4 w-4 mr-1.5" /> Add Experience
        </Button>
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
          onClick={handleSave}
          disabled={isConfirming}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 shadow-lg shadow-emerald-600/20"
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Confirm &amp; Save Profile
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onReset}
          disabled={isConfirming}
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
