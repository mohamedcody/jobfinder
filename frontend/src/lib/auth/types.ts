export interface AuthResponse {
  token: string | null;
  email: string;
  role: string;
  message: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendVerificationOtpPayload {
  email: string;
}

export interface ApiErrorShape {
  message?: string;
  error?: string;
  details?: string;
}

