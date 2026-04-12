import { VerifyEmailForm } from "@/app/(auth)/verify-email/verify-email-form";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  return <VerifyEmailForm initialEmail={params.email ?? ""} />;
}
