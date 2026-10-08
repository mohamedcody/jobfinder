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
      <div className="group mb-4 relative">
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground-muted group-focus-within:text-primary transition-colors">
          {label}
        </label>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={isVisible ? "text" : "password"}
            icon={icon}
            error={error}
            className="pr-20"
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            className="absolute right-4 top-1/2 inline-flex h-7 -translate-y-1/2 items-center justify-center rounded-lg px-2 text-xs font-semibold text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        </div>
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
