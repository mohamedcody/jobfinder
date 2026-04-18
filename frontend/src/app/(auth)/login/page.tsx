"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSocialLogin } from "@/components/auth/auth-social-login";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/lib/auth/api-error";
import { authService } from "@/lib/auth/auth-service";
import { useAuthSession } from "@/lib/auth/use-auth-session";

const LOGIN_LOCK_UNTIL_KEY = "jobfinder.auth.login-lock-until";
const DEFAULT_LOCK_DURATION_SECONDS = 60;
const getNowMs = () => new Date().getTime();

const authTabs = (
  <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/20 bg-slate-900/45 p-1.5 shadow-inner">
    <Link
      href="/login"
      aria-current="page"
      className="rounded-xl bg-linear-to-r from-violet-600 to-sky-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-500/20"
    >
      Login
    </Link>
    <Link
      href="/register"
      className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      Register
    </Link>
  </div>
);

const authFooterMark = (
  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-600 text-xs font-black text-white shadow-lg shadow-slate-900/20">
    N
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const session = useAuthSession();
  const [lockUntil, setLockUntil] = useState<number | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.sessionStorage.getItem(LOGIN_LOCK_UNTIL_KEY);
    if (!raw) {
      return null;
    }


    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > getNowMs()) {
      return parsed;
    }

    window.sessionStorage.removeItem(LOGIN_LOCK_UNTIL_KEY);
    return null;
  });
  const [now, setNow] = useState<number>(() => getNowMs());

  useEffect(() => {
    if (!lockUntil) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const current = getNowMs();
      setNow(current);

      if (current >= lockUntil) {
        setLockUntil(null);
        window.sessionStorage.removeItem(LOGIN_LOCK_UNTIL_KEY);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [lockUntil]);

  const lockSecondsRemaining = useMemo(() => {
    if (!lockUntil) {
      return 0;
    }

    return Math.max(0, Math.ceil((lockUntil - now) / 1000));
  }, [lockUntil, now]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (lockSecondsRemaining > 0) {
      toast.error(`Too many failed attempts. Try again in ${lockSecondsRemaining}s.`);
      return;
    }

    try {
      const response = await authService.login(values);

      if (response.token) {
        session.login(response.token);
      }

      toast.success(response.message || "Welcome back!");
      router.push("/jobs");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 423) {
        const retryAfterHeader = error.response.headers?.["retry-after"];
        const retryAfterSeconds = Number(retryAfterHeader);
        const lockDurationSeconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds
          : DEFAULT_LOCK_DURATION_SECONDS;
        const currentNow = getNowMs();
        const nextLockUntil = currentNow + lockDurationSeconds * 1000;

        setLockUntil(nextLockUntil);
        setNow(currentNow);
        window.sessionStorage.setItem(LOGIN_LOCK_UNTIL_KEY, String(nextLockUntil));
      }

      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Login with your email or username."
      prelude={authTabs}
      footer={authFooterMark}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          id="identifier"
          label="Email or username"
          placeholder="yourusername"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register("identifier")}
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="•••••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right">
          <Link href="/forgot-password" className="soft-link text-sm font-semibold hover:underline">
            Forgot password?
          </Link>
        </div>

        <SubmitButton isLoading={isSubmitting} disabled={lockSecondsRemaining > 0}>
          {lockSecondsRemaining > 0 ? `Try again in ${lockSecondsRemaining}s` : "Login"}
        </SubmitButton>
      </form>

      <AuthSocialLogin />

      <p className="mt-6 text-sm text-slate-300">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="soft-link font-semibold hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  );
}

