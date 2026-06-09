import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  return <ResetPasswordForm initialEmail={params.email ?? ""} />;
}
