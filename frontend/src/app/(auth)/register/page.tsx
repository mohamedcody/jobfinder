"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { TextField } from "@/components/auth/text-field";
import { UserCircle2, Mail, Lock } from "lucide-react";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/lib/auth/api-error";
import { authService } from "@/lib/auth/auth-service";

const authTabs = (
  <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/20 bg-slate-900/45 p-1.5 shadow-inner">
    <Link
      href="/login"
      className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      Login
    </Link>
    <Link
      href="/register"
      aria-current="page"
      className="rounded-xl bg-linear-to-r from-violet-600 to-sky-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-violet-500/20"
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

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authService.register({
        username: values.username,
        email: values.email,
        password: values.password,
      });

      toast.success("Registration successful. Verify your email OTP to continue.");
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Register to start using JobFinder."
      prelude={authTabs}
      footer={authFooterMark}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          id="username"
          label="Username"
          placeholder="yourusername"
          autoComplete="username"
          error={errors.username?.message}
          icon={UserCircle2}
          {...register("username")}
        />

        <TextField
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          icon={Mail}
          {...register("email")}
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          icon={Lock}
          {...register("password")}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          icon={Lock}
          {...register("confirmPassword")}
        />

        <SubmitButton isLoading={isSubmitting}>Create account</SubmitButton>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="soft-link font-semibold hover:underline">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}

