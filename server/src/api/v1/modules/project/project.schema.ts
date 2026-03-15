import { z } from "zod";
import { ProjectStatus } from "../../../../core/enums/status";

const projectIdParam = z.object({
    id: z.string()
        .regex(/^\d+$/, "Invalid Project ID")
        .transform((val) => BigInt(val))
        .refine((v) => v > 0n, "Invalid Project ID"),
});

export const getProjectsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['code', 'name']).optional(),
        code: z.string().optional(),
        name: z.string().optional(),
        status: z.enum([ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED]).optional(),
        ownerSearch: z.string().optional(),
        ownerSearchField: z.enum(['fullname', 'phone', 'email']).optional(),
        sortBy: z.enum(['id', 'code', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional().default({}),
});

export const getProjectDetailSchema = z.object({
    params: projectIdParam,
});

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        ownerId: z.string()
            .regex(/^\d+$/, "Invalid Owner ID")
            .transform((val) => BigInt(val))
            .optional(),
        description: z.string().optional(),
        bgColor: z.string().optional(),
    }),
});

export const updateProjectSchema = z.object({
    params: projectIdParam,
    body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        bgColor: z.string().optional(),
        status: z.enum([ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED]).optional(),
    }).optional(),
});

export const archiveProjectSchema = z.object({ params: projectIdParam });

export const starProjectSchema = z.object({ params: projectIdParam });
