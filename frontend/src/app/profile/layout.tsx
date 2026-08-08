import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile — JobFinder",
  description:
    "View and manage your professional profile, skills, career intelligence, and job preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
