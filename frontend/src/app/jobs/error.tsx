"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface JobsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobsError({ error, reset }: JobsErrorProps) {
  useEffect(() => {
	console.error("Jobs page error:", error);
  }, [error]);

  return (
	<div className="jobs-page-background flex min-h-screen items-center justify-center px-4">
	  <div className="glass-panel w-full max-w-lg rounded-3xl p-8 text-center">
		<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/30 bg-red-500/10 text-red-300">
		  <AlertCircle className="h-7 w-7" />
		</div>
		<h1 className="mt-4 text-2xl font-black text-white">Could not load jobs</h1>
		<p className="mt-2 text-sm text-[#D1D5DB]">
		  We failed to render the jobs dashboard. Please try again.
		</p>
		<button
		  type="button"
		  onClick={reset}
		  aria-label="Retry jobs page"
		  className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(160,32,240,0.8)] transition hover:brightness-110"
		>
		  <RefreshCw className="h-4 w-4" />
		  Retry
		</button>
	  </div>
	</div>
  );
}

