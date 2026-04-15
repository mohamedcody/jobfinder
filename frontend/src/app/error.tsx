"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="jobs-page-background flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/30 bg-red-500/10 text-red-300">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#D1D5DB]">
          We hit an unexpected issue while rendering this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(160,32,240,0.8)] transition hover:brightness-110"
          aria-label="Try rendering the page again"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

