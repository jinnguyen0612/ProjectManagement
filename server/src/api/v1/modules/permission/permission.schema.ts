import { z } from "zod";

const permissionIdParam = z.object({
    id: z.string()
        .regex(/^\d+$/, "Invalid Permission ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid Permission ID"),
});

export const getPermissionsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['key', 'name']).optional(),
        sortBy: z.enum(['id', 'key', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional().default({}),
});

export const getPermissionDetailSchema = z.object({ params: permissionIdParam });

export const createPermissionSchema = z.object({
    body: z.object({
        key: z.string().min(1),
        name: z.string().min(1),
    }),
});

export const updatePermissionSchema = z.object({
    params: permissionIdParam,
    body: z.object({
        key: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
    }).optional(),
});
