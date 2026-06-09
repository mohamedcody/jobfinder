"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpField } from "@/components/auth/otp-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/lib/auth/api-error";
import { authService } from "@/lib/auth/auth-service";

interface VerifyEmailFormProps {
  initialEmail: string;
}

const RESEND_COOLDOWN_SECONDS = 120;
const RESEND_COOLDOWN_STORAGE_KEY = "verify-email-resend-cooldown-until";

export function VerifyEmailForm({ initialEmail }: VerifyEmailFormProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
  });

  const emailValue = watch("email");

  const startCooldown = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const cooldownUntil = Date.now() + safeSeconds * 1000;
    sessionStorage.setItem(RESEND_COOLDOWN_STORAGE_KEY, String(cooldownUntil));
    setCooldownRemaining(safeSeconds);
  };

  useEffect(() => {
    const storedValue = sessionStorage.getItem(RESEND_COOLDOWN_STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    const cooldownUntil = Number(storedValue);
    if (!Number.isFinite(cooldownUntil)) {
      sessionStorage.removeItem(RESEND_COOLDOWN_STORAGE_KEY);
      return;
    }

    const initialSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    setCooldownRemaining(initialSeconds);

    if (initialSeconds === 0) {
      sessionStorage.removeItem(RESEND_COOLDOWN_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (cooldownRemaining <= 0) {
      sessionStorage.removeItem(RESEND_COOLDOWN_STORAGE_KEY);
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownRemaining((previous) => {
        if (previous <= 1) {
          sessionStorage.removeItem(RESEND_COOLDOWN_STORAGE_KEY);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  const onSubmit = async (values: VerifyEmailFormValues) => {
    try {
      await authService.verifyEmail(values);
      toast.success("Email verified successfully. Please login.");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const onResendOtp = async () => {
    const normalizedEmail = emailValue.trim();
    if (!normalizedEmail) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      setIsResending(true);
      const message = await authService.resendVerificationOtp({ email: normalizedEmail });
      startCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(message || "A new OTP has been sent to your email.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        startCooldown(RESEND_COOLDOWN_SECONDS);
      }
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const resendDisabled = isResending || isSubmitting || cooldownRemaining > 0;
  const resendLabel = cooldownRemaining > 0
    ? `Resend OTP in ${cooldownRemaining}s`
    : "Resend OTP";

  return (
    <AuthShell
      title="Verify your email"
      description="Enter the 6-digit verification code sent to your inbox."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <OtpField
          id="otp"
          label="Verification Code"
          placeholder="123456"
          error={errors.otp?.message}
          {...register("otp")}
        />

        <SubmitButton isLoading={isSubmitting}>Verify email</SubmitButton>
      </form>

      <button
        type="button"
        onClick={onResendOtp}
        disabled={resendDisabled}
        className="secondary-button mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isResending ? "Sending..." : resendLabel}
      </button>

      <div className="mt-6 flex items-center justify-between text-sm text-[var(--muted)]">
        <Link href="/register" className="soft-link font-semibold hover:underline">
          Register again
        </Link>
        <Link href="/login" className="soft-link font-semibold hover:underline">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}

