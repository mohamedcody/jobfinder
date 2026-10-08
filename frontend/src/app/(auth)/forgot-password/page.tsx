"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { TextField } from "@/features/auth/components/text-field";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/utils/api-error";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await authService.forgotPassword({ email: values.email });
      toast.success("If the email exists, an OTP has been sent.");
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we will send you a reset OTP."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <SubmitButton isLoading={isSubmitting}>Send reset OTP</SubmitButton>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Back to{" "}
        <Link href="/login" className="soft-link font-semibold hover:underline">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}

