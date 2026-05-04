import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ 
  children, 
  className = "",
  variant = "default",
  ...props 
}: BadgeProps) {
  const variants = {
    default: "bg-slate-600 text-white",
    secondary: "bg-slate-200 text-slate-900",
    destructive: "bg-red-600 text-white",
    outline: "border border-slate-200 text-slate-900",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
        variants[variant]
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

