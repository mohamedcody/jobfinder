import type { Metadata } from "next";
import { Suspense } from "react";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";
import "./tokens.css";

export const metadata: Metadata = {
  title: {
    default: "JobFinder PRO | Discover Your Dream Tech Role",
    template: "%s | JobFinder PRO",
  },
  description: "A premium, lightning-fast job search workspace where refined filters, intelligent matching, and crystal-clear workflows help you land the role you deserve.",
  keywords: ["jobs", "tech roles", "hiring", "ATS", "career", "developer jobs"],
  authors: [{ name: "Mohamed Saad" }],
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense
          fallback={
            <div className="jobs-page-background flex min-h-screen items-center justify-center text-sm text-[#D1D5DB]">
              Loading application...
            </div>
          }
        >
          {children}
        </Suspense>
        <AppToaster />
      </body>
    </html>
  );
}
