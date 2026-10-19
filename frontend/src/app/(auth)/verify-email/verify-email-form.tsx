"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpField } from "@/features/auth/components/otp-field";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { TextField } from "@/features/auth/components/text-field";
import { Button } from "@/components/ui/button";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/utils/api-error";
import { authService } from "@/services/auth.service";

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

      <Button
        type="button"
        variant="secondary"
        onClick={onResendOtp}
        disabled={resendDisabled}
        isLoading={isResending}
        loadingText="Sending..."
        className="mt-3 w-full h-11 text-xs font-semibold"
      >
        {resendLabel}
      </Button>

      <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
        <Link href="/register" className="text-slate-400 hover:text-white transition-colors">
          Register again
        </Link>
        <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}

