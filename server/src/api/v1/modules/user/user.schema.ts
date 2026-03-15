import { z } from "zod";
import { UserStatus } from "../../../../core/enums/status";

const userIdParam = z.object({
    id: z.string()
        .regex(/^\d+$/, "Invalid user ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid user ID"),
});

export const getUsersSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['email', 'fullname', 'phone']).optional(),
        status: z.enum(['active', 'inactive', 'blocked']).optional(),
        status_in: z.string().optional(),
        sortBy: z.enum(['email', 'fullname', 'createdAt', 'updatedAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional().default({}),
});

export const getUserDetailSchema = z.object({
    params: userIdParam,
});

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email(),
        phone: z.string().min(10, "Phone must be at least 10 characters").max(15, "Phone must be at most 15 characters").optional(),
        avatar: z.string().url("Avatar must be a valid URL").nullable(),
        fullname: z.string().min(1).max(255),
        bio: z.string().max(500).optional(),
        address: z.string().optional(),
        roleId: z.string()
            .regex(/^\d+$/, "Invalid role ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid role ID"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
        status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]).optional(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
});

export const updateUserSchema = z.object({
    params: userIdParam,
    body: z.object({
        password: z.string().min(6, "Password must be at least 6 characters").optional(),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters").optional(),
        roleId: z.string()
            .regex(/^\d+$/, "Invalid role ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid role ID")
            .optional(),
    }).refine(
        (data) => {
            if (data.password) {
                return data.confirmPassword && data.password === data.confirmPassword;
            }
            return true;
        },
        { message: "Passwords do not match", path: ["confirmPassword"] }
    ).optional(),
});

export const blockUserSchema = z.object({ params: userIdParam });

export const updateUserPermissionSchema = z.object({
    params: userIdParam,
    body: z.object({
        permissions: z.array(
            z.string()
                .regex(/^\d+$/, "Invalid permission ID")
                .transform((val) => BigInt(val))
                .refine((v) => v > 0n, "Invalid permission ID")
        ).min(0),
    }),
});

// Types
export type GetUsersQuery = z.infer<typeof getUsersSchema>["query"];
export type CreateUserBody = z.infer<typeof createUserSchema>["body"];
export type UpdateUserBody = z.infer<typeof updateUserSchema>["body"];
