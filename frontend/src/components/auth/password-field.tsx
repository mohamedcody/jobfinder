"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-100">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isVisible ? "text" : "password"}
            className="field-input w-full rounded-xl px-3.5 py-2.5 pr-24 text-sm text-slate-100 shadow-sm focus:outline-none"
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 inline-flex h-8 -translate-y-1/2 items-center rounded-md px-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-slate-100"
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        </div>
        {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
