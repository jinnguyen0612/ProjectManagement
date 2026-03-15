import { z } from "zod";

const roleIdParam = z.object({
    id: z.string()
        .regex(/^\d+$/, "Invalid Role ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid Role ID"),
});

export const getRolesSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['name']).optional(),
        sortBy: z.enum(['id', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional().default({}),
});

export const getRoleDetailSchema = z.object({ params: roleIdParam });

export const createRoleSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        permissionIds: z.array(
            z.string()
                .regex(/^\d+$/, "Invalid permission ID")
                .transform((val) => BigInt(val))
                .refine((v) => v > 0n, "Invalid permission ID")
        ).min(0),
    }),
});

export const updateRoleSchema = z.object({
    params: roleIdParam,
    body: z.object({
        name: z.string().min(1).optional(),
        permissionIds: z.array(
            z.string()
                .regex(/^\d+$/, "Invalid permission ID")
                .transform((val) => BigInt(val))
                .refine((v) => v > 0n, "Invalid permission ID")
        ).optional(),
    }).optional(),
});
