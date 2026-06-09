"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpField } from "@/components/auth/otp-field";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/lib/auth/api-error";
import { authService } from "@/lib/auth/auth-service";

interface ResetPasswordFormProps {
  initialEmail: string;
}

export function ResetPasswordForm({ initialEmail }: ResetPasswordFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otpCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword(values);
      toast.success("Password reset successful. You can login now.");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Reset password"
      description="Enter your email, OTP and new password."
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

        <OtpField
          id="otpCode"
          label="OTP code"
          placeholder="123456"
          error={errors.otpCode?.message}
          {...register("otpCode")}
        />

        <PasswordField
          id="newPassword"
          label="New password"
          placeholder="Create a strong new password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <SubmitButton isLoading={isSubmitting}>Reset password</SubmitButton>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-[var(--muted)]">
        <Link href="/forgot-password" className="soft-link font-semibold hover:underline">
          Resend OTP
        </Link>
        <Link href="/login" className="soft-link font-semibold hover:underline">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
