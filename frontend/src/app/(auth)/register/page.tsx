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
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/lib/auth/api-error";
import { authService } from "@/lib/auth/auth-service";

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
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField
          id="username"
          label="Username"
          placeholder="yourusername"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />

        <TextField
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
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

