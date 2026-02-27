import { z } from "zod";

export const updateProfileSchema = z.object({
    body: z.object({
        fullname: z.string().min(1, "Fullname is required").optional(),
        avatar: z.string().url("Avatar must be a valid URL").optional(),
        bio: z.string().optional(),
        address: z.string().optional(),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(1, "New password is required"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];