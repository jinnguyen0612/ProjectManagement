import { z } from "zod";

export const getPermissionsSchema = z.object({
    query: z.object({
        // Pagination
        page: z.string().optional(),
        limit: z.string().optional(),

        // Search
        search: z.string().optional(),
        searchField: z.enum(['key', 'name']).optional(),

        // Sort
        sortBy: z.enum(['id', 'key', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).passthrough().optional().default({}),
})

export const getPermissionDetailSchema = z.object({
    body: z.object({}).optional(),
    params: z.object({
        id: z
            .string()
            .regex(/^\d+$/, "Invalid Permission ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid Permission ID"),
    }),
    query: z.object({}).optional()
})

export const createPermissionSchema = z.object({
    body: z.object({
        key: z.string().min(1),
        name: z.string().min(1),
    }),
})

export const updatePermissionSchema = z.object({
    body: z.object({
        key: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
    }).optional(),
    params: z.object({
        id: z
            .string()
            .regex(/^\d+$/, "Invalid Permission ID")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid Permission ID"),
    }),
})
