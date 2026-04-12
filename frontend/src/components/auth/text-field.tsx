import { forwardRef, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className="field-input w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none"
          {...props}
        />
        {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
      </div>
    );
  }
);

TextField.displayName = "TextField";
