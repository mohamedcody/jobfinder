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
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isVisible ? "text" : "password"}
            className="field-input w-full rounded-xl px-3.5 py-2.5 pr-24 text-sm text-slate-900 shadow-sm focus:outline-none"
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 inline-flex h-7 -translate-y-1/2 items-center rounded-md px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
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
