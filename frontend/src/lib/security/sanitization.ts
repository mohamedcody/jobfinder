/**
 * Security Utilities for XSS Prevention
 * أدوات الأمان لمنع هجمات XSS
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * تحويل أحرف HTML الخاصة لمنع هجمات XSS
 */
export const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return "";
  if (typeof document === "undefined") return text;

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitizes user input to remove potentially harmful content
 * تنظيف مدخلات المستخدم لإزالة المحتوى الضار
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return "";

  // Remove script tags and event handlers
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .trim();

  return escapeHtml(sanitized);
};

/**
 * Validates URL safety - only allows http/https
 * التحقق من أمان الرابط - السماح فقط بـ http/https
 */
export const isSafeUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes a URL - returns empty string if not safe
 * تنظيف الرابط - إرجاع string فارغ إذا كان غير آمن
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  return isSafeUrl(url) ? url : "";
};

/**
 * Sanitizes email - basic validation
 * تنظيف البريد الإلكتروني - التحقق الأساسي
 */
export const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email) return "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email.trim().toLowerCase() : "";
};

/**
 * Sanitizes a large text block with length limit
 * تنظيف نصل طويل مع حد أقصى للطول
 */
export const sanitizeTextField = (
  text: string | null | undefined,
  maxLength: number = 1000
): string => {
  if (!text) return "";

  const trimmed = text.trim();
  if (trimmed.length > maxLength) {
    return sanitizeInput(trimmed.substring(0, maxLength));
  }

  return sanitizeInput(trimmed);
};

/**
 * Sanitizes numeric input
 * تنظيف المدخلات الرقمية
 */
export const sanitizeNumber = (value: unknown, min?: number, max?: number): number | null => {
  const num = Number(value);

  if (Number.isNaN(num)) return null;
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;

  return num;
};

/**
 * Sanitizes array of strings (e.g., skills)
 * تنظيف قائمة من النصوص (مثل المهارات)
 */
export const sanitizeStringArray = (
  items: unknown[],
  maxItems: number = 50,
  maxItemLength: number = 50
): string[] => {
  if (!Array.isArray(items)) return [];

  return items
    .slice(0, maxItems)
    .map((item) => {
      const str = String(item).trim();
      return sanitizeInput(str.substring(0, maxItemLength));
    })
    .filter((item) => item.length > 0);
};

