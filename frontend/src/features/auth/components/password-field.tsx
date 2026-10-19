"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, icon, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="group mb-4">
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground-muted group-focus-within:text-primary transition-colors">
          {label}
        </label>
        <Input
          ref={ref}
          id={id}
          type={isVisible ? "text" : "password"}
          icon={icon}
          error={error}
          rightElement={
            <button
              type="button"
              onClick={() => setIsVisible((prev) => !prev)}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              className="inline-flex h-7 items-center justify-center rounded-lg px-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            >
              {isVisible ? "Hide" : "Show"}
            </button>
          }
          {...props}
        />
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
