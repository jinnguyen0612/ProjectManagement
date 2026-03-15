import { z } from "zod";

const idParam = z.object({
    id: z.string()
        .regex(/^\d+$/, "Invalid ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid ID"),
});

export const getProjectPermissionsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['id', 'key', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional().default({}),
});

export const getProjectPermissionDetailSchema = z.object({
    params: idParam,
});

export const createProjectPermissionSchema = z.object({
    body: z.object({
        key: z.string().min(1),
        name: z.string().min(1),
    }),
});

export const updateProjectPermissionSchema = z.object({
    params: idParam,
    body: z.object({
        key: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
    }),
});

export const deleteProjectPermissionSchema = z.object({
    params: idParam,
});
