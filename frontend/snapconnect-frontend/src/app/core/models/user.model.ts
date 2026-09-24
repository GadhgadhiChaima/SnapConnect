/* User model, auth responses */
export type UserRole = 'CLIENT' | 'CREATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
  title?: string;
  bio?: string;
  location?: string;
  smartphoneModel?: string;
  dailyRate?: number;
  hourlyRate?: number;
  onboarded?: boolean;
  contentFormat?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  requiresVerification?: boolean;
  testOtp?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  email?: string;
  message?: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  requiresVerification: boolean;
  testOtp?: string;
}


