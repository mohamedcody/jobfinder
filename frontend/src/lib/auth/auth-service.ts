import { apiClient } from "@/lib/auth/api-client";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResendVerificationOtpPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/lib/auth/types";

export const authService = {
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<AuthResponse>("/register", payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>("/login", payload);
    return data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const { data } = await apiClient.post<string>("/forgot-password", payload);
    return data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const { data } = await apiClient.post<string>("/reset-password", payload);
    return data;
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    const { data } = await apiClient.post<string>("/verify-email", payload);
    return data;
  },

  async resendVerificationOtp(payload: ResendVerificationOtpPayload) {
    const { data } = await apiClient.post<string>("/resend-verification-otp", payload);
    return data;
  },
};

