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
import { motion } from "framer-motion";

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

      toast.success("Identity established. Verify your email OTP to continue.");
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Create Identity"
      description="Join the elite platform for modern careers."
      prelude={<AuthTabs active="register" />}
      footer={authFooterMark}
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <TextField
            id="username"
            label="Visual Identity"
            placeholder="Unique username"
            autoComplete="username"
            error={errors.username?.message}
            icon={UserCircle2}
            {...register("username")}
          />

          <TextField
            id="email"
            type="email"
            label="Secure Contact"
            placeholder="Email address"
            autoComplete="email"
            error={errors.email?.message}
            icon={Mail}
            {...register("email")}
          />

          <PasswordField
            id="password"
            label="Primary Key"
            placeholder="Strong security key"
            autoComplete="new-password"
            error={errors.password?.message}
            icon={Lock}
            {...register("password")}
          />

          <PasswordField
            id="confirmPassword"
            label="Verify Key"
            placeholder="Repeat security key"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            icon={Lock}
            {...register("confirmPassword")}
          />

          <SubmitButton isLoading={isSubmitting}>Establish Account</SubmitButton>
        </form>

        <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors ml-1">
            Authorize Access
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
