import { forwardRef, type InputHTMLAttributes } from "react";

interface OtpFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export const OtpField = forwardRef<HTMLInputElement, OtpFieldProps>(
  ({ id, label, error, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm tracking-[0.3em] text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }
);

OtpField.displayName = "OtpField";
