/**
 * Validation utilities for profile form fields
 * Provides real-time validation feedback for enterprise-grade UX
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  type?: "success" | "error" | "warning";
}

// URL validation patterns
const URL_PATTERNS = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  github: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
  website: /^https?:\/\/(www\.)?[\w-]+\.[\w.-]+\/?$/,
};

export const validators = {
  // LinkedIn URL validation
  linkedinUrl: (url: string): ValidationResult => {
    if (!url) return { isValid: true }; // Optional field
    if (url.match(URL_PATTERNS.linkedin)) {
      return { isValid: true, type: "success" };
    }
    return {
      isValid: false,
      message: "Invalid LinkedIn URL. Use: https://linkedin.com/in/yourprofile",
      type: "error",
    };
  },

  // GitHub URL validation
  githubUrl: (url: string): ValidationResult => {
    if (!url) return { isValid: true }; // Optional field
    if (url.match(URL_PATTERNS.github)) {
      return { isValid: true, type: "success" };
    }
    return {
      isValid: false,
      message: "Invalid GitHub URL. Use: https://github.com/yourprofile",
      type: "error",
    };
  },

  // Website URL validation
  websiteUrl: (url: string): ValidationResult => {
    if (!url) return { isValid: true }; // Optional field
    try {
      new URL(url);
      return { isValid: true, type: "success" };
    } catch {
      return {
        isValid: false,
        message: "Invalid URL format. Use: https://example.com",
        type: "error",
      };
    }
  },

  // Email validation
  email: (email: string): ValidationResult => {
    if (!email) return { isValid: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, type: "success" };
    }
    return {
      isValid: false,
      message: "Invalid email format",
      type: "error",
    };
  },

  // Job title validation
  jobTitle: (title: string): ValidationResult => {
    if (!title) return { isValid: true };
    if (title.length < 2) {
      return {
        isValid: false,
        message: "Job title too short",
        type: "error",
      };
    }
    if (title.length > 150) {
      return {
        isValid: false,
        message: "Job title too long (max 150 characters)",
        type: "error",
      };
    }
    return { isValid: true, type: "success" };
  },

  // Years of experience validation
  yearsOfExperience: (years: number): ValidationResult => {
    if (years < 0) {
      return {
        isValid: false,
        message: "Years cannot be negative",
        type: "error",
      };
    }
    if (years > 70) {
      return {
        isValid: false,
        message: "Years seems invalid",
        type: "error",
      };
    }
    return { isValid: true, type: "success" };
  },

  // Salary validation
  salary: (salary: number): ValidationResult => {
    if (salary < 0) {
      return {
        isValid: false,
        message: "Salary cannot be negative",
        type: "error",
      };
    }
    if (salary > 10000000) {
      return {
        isValid: true,
        message: "High salary amount - please verify",
        type: "warning",
      };
    }
    return { isValid: true, type: "success" };
  },

  // Bio validation
  bio: (bio: string): ValidationResult => {
    if (!bio) return { isValid: true };
    if (bio.length < 10) {
      return {
        isValid: false,
        message: "Bio too short (min 10 characters)",
        type: "error",
      };
    }
    if (bio.length > 1000) {
      return {
        isValid: false,
        message: "Bio too long (max 1000 characters)",
        type: "error",
      };
    }
    return { isValid: true, type: "success" };
  },
};

/**
 * Calculate profile completion percentage
 * Used for the "Market Readiness" gauge
 */
export function calculateProfileCompletion(profile: Partial<Record<string, unknown>>): number {
  const fields = [
    "currentJobTitle",
    "yearsOfExperience",
    "educationLevel",
    "country",
    "city",
    "expectedSalary",
    "currency",
    "bio",
  ];

  const filledFields = fields.filter((field) => {
    const value = profile?.[field];
    return value !== null && value !== undefined && value !== "";
  }).length;

  return Math.round((filledFields / fields.length) * 100);
}

/**
 * Get a helpful hint based on the field name
 */
export const fieldHints: Record<string, string> = {
  currentJobTitle: "Your current professional position",
  yearsOfExperience: "Total years in your field",
  educationLevel: "Your highest educational qualification",
  country: "Country of residence",
  city: "Your city",
  expectedSalary: "Expected annual salary",
  currency: "Salary currency",
  bio: "A brief professional summary about yourself",
  linkedinUrl: "Your LinkedIn profile URL for social verification",
  githubUrl: "Your GitHub profile URL to showcase your projects",
  websiteUrl: "Your personal portfolio or website",
};

