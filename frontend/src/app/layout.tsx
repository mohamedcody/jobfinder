import type { Metadata } from "next";
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
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
