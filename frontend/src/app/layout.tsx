import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AppToaster } from "@/components/providers/app-toaster";
import { AuthGuard } from "@/components/auth/auth-guard";
import "./globals.css";
import "./tokens.css";

export const metadata: Metadata = {
  title: {
    default: "JobFinder PRO | Discover Your Dream Tech Role",
    template: "%s | JobFinder PRO",
  },
  description: "A premium, lightning-fast job search workspace where refined filters, intelligent matching, and crystal-clear workflows help you land the role you deserve.",
  keywords: ["jobs", "tech roles", "hiring", "ATS", "career", "developer jobs", "AI job search"],
  authors: [{ name: "Mohamed Saad" }],
  openGraph: {
    title: "JobFinder PRO | Discover Your Dream Tech Role",
    description: "A premium, lightning-fast job search workspace to help you land the role you deserve.",
    url: "https://jobfinder.com",
    siteName: "JobFinder PRO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobFinder PRO | Discover Your Dream Tech Role",
    description: "A premium, lightning-fast job search workspace to help you land the role you deserve.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
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
          <AuthGuard>
            {children}
          </AuthGuard>
        </Suspense>
        <AppToaster />
      </body>
    </html>
  );
}
