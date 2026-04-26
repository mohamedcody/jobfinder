"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSocialLogin } from "@/components/auth/auth-social-login";
import { PasswordField } from "@/components/auth/password-field";
import { UserCircle2, Lock } from "lucide-react";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/lib/auth/api-error";
import { authService } from "@/lib/auth/auth-service";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { motion } from "framer-motion";

const LOGIN_LOCK_UNTIL_KEY = "jobfinder.auth.login-lock-until";
const DEFAULT_LOCK_DURATION_SECONDS = 60;
const getNowMs = () => new Date().getTime();

const AuthTabs = ({ active }: { active: "login" | "register" }) => (
  <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-white/5 bg-black/20 p-1.5 shadow-inner backdrop-blur-md">
    <Link
      href="/login"
      className={`relative z-10 rounded-xl px-4 py-3 text-center text-sm font-bold transition-colors duration-300 ${
        active === "login" ? "text-white" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      Login
      {active === "login" && (
        <motion.div
          layoutId="active-auth-tab"
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
    <Link
      href="/register"
      className={`relative z-10 rounded-xl px-4 py-3 text-center text-sm font-bold transition-colors duration-300 ${
        active === "register" ? "text-white" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      Register
      {active === "register" && (
        <motion.div
          layoutId="active-auth-tab"
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  </div>
);

const authFooterMark = (
  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a0c24] to-slate-800 border border-white/5 text-xs font-black text-white shadow-2xl">
    JF
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const session = useAuthSession();
  
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => getNowMs());

  useEffect(() => {
    const raw = window.sessionStorage.getItem(LOGIN_LOCK_UNTIL_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed > getNowMs()) {
        const timer = setTimeout(() => setLockUntil(parsed), 0);
        return () => clearTimeout(timer);
      } else {
        window.sessionStorage.removeItem(LOGIN_LOCK_UNTIL_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!lockUntil) return;

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
    if (!lockUntil) return 0;
    return Math.max(0, Math.ceil((lockUntil - now) / 1000));
  }, [lockUntil, now]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (lockSecondsRemaining > 0) {
      toast.error(`Too many failed attempts. Try again in ${lockSecondsRemaining}s.`);
      return;
    }

    try {
      const response = await authService.login(values);
      if (response.token) session.login(response.token);
      toast.success(response.message || "Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 423) {
        const retryAfterHeader = error.response.headers?.["retry-after"];
        const retryAfterSeconds = Number(retryAfterHeader);
        const lockDurationSeconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds : DEFAULT_LOCK_DURATION_SECONDS;
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
      title="Secure Login"
      description="Access your elite career dashboard."
      prelude={<AuthTabs active="login" />}
      footer={authFooterMark}
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <TextField
            id="identifier"
            label="Account Identity"
            placeholder="Username or email"
            autoComplete="username"
            error={errors.identifier?.message}
            icon={UserCircle2}
            {...register("identifier")}
          />

          <PasswordField
            id="password"
            label="Security Key"
            placeholder="•••••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            icon={Lock}
            {...register("password")}
          />

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-white/5 bg-white/5 text-violet-600 focus:ring-violet-500/20" />
              <label htmlFor="remember" className="text-xs font-medium text-slate-400">Remember me</label>
            </div>
            <Link href="/forgot-password" title="Recover access" className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Forgot security key?
            </Link>
          </div>

          <SubmitButton isLoading={isSubmitting} disabled={lockSecondsRemaining > 0}>
            {lockSecondsRemaining > 0 ? `Identity Locked (${lockSecondsRemaining}s)` : "Authorize Access"}
          </SubmitButton>
        </form>

        <AuthSocialLogin />

        <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          New to JobFinder?{" "}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 transition-colors ml-1">
            Create Identity
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
