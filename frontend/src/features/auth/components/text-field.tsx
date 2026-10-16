"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, icon, ...props }, ref) => {
    return (
      <div className="group mb-4">
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground-muted group-focus-within:text-primary transition-colors">
          {label}
        </label>
        <Input
          ref={ref}
          id={id}
          icon={icon}
          error={error}
          {...props}
        />
      </div>
    );
  }
);

TextField.displayName = "TextField";
