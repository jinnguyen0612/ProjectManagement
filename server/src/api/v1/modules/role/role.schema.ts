import { z } from "zod";

export const getRolesSchema = z.object({
    query: z.object({
        // Pagination
        page: z.string().optional(),
        limit: z.string().optional(),

        // Search
        search: z.string().optional(),
        searchField: z.enum(['name']).optional(),

        // Sort
        sortBy: z.enum(['id', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).passthrough().optional().default({}),
})

export const getRoleDetailSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({
        id: z
            .string()
            .regex(/^\d+$/, "Invalid Role ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid Role ID"),
    }),
    query: z.object({}).optional()
})

export const createRoleSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        permissionIds: z.array(
            z.string()
                .regex(/^\d+$/, "Invalid permission ID")
                .transform((val) => BigInt(val))
                .refine((v) => v > 0n, "Invalid permission ID")
        ).min(0, "Permissions array is required"),
    }),
})

export const updateRoleSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        permissionIds: z.array(
            z.string()
                .regex(/^\d+$/, "Invalid permission ID")
                .transform((val) => BigInt(val))
                .refine((v) => v > 0n, "Invalid permission ID")
        ).optional(),
    }).optional(),
    params: z.object({
        id: z
            .string()
            .regex(/^\d+$/, "Invalid Role ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid Role ID"),
    }),
})
