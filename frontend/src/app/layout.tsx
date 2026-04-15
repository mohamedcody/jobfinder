import type { Metadata } from "next";
import { Suspense } from "react";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFinder",
  description: "JobFinder authentication and jobs platform",
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
