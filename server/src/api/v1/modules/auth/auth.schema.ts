import { z } from "zod";
import { OtpType } from "../../../../core/enums/OtpType";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email is invalid"),
    phone: z.string().min(10, "Phone must be at least 10 characters").max(15, "Phone must be at most 15 characters"),
    avatar: z.string().url("Avatar must be a valid URL").nullable(),
    fullname: z.string().min(1, "Fullname is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const resendOTPSchema = z.object({
  body: z.object({
    email: z.string().email("Email is invalid"),
    type: z.enum([OtpType.REGISTER, OtpType.FORGOT_PASSWORD]).default(OtpType.REGISTER),
  }),
});

export const verifyRegisterSchema = z.object({
  body: z.object({
    email: z.string().email("Email is invalid"),
    otp: z.string().min(6, "OTP must be at least 6 characters"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, "Access token is required"),
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyRegisterInput = z.infer<typeof verifyRegisterSchema>["body"];
export type ResendOTPIput = z.infer<typeof resendOTPSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];