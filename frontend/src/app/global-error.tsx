"use client";

import { AlertOctagon } from "lucide-react";

export default function GlobalError() {
  return (
    <html lang="en">
      <body className="jobs-page-background flex min-h-screen items-center justify-center px-4 text-white antialiased">
        <main className="glass-panel w-full max-w-xl rounded-3xl p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/30 bg-red-500/10 text-red-300">
            <AlertOctagon className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black">Critical application error</h1>
          <p className="mt-2 text-sm text-[#D1D5DB]">
            Please refresh the page. If this keeps happening, contact support.
          </p>
        </main>
      </body>
    </html>
  );
}

