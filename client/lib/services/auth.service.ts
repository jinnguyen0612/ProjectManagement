import api from "@/lib/api";
import { ApiResponse, AuthResponse, User } from "@/types";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<User>>("/auth/register", payload),

  verifyRegister: (payload: VerifyOtpPayload) =>
    api.post<ApiResponse<AuthResponse>>("/auth/verify-register", payload),

  refreshToken: (accessToken: string, refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token", {
      accessToken,
      refreshToken,
    }),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get<ApiResponse<User>>("/profile/me"),
};
