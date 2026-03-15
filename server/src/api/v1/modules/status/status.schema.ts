import { z } from "zod";

const projectIdParam = z.object({
    id: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
});

const statusIdParam = z.object({
    id: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
    statusId: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
});

export const getStatusesSchema = z.object({ params: projectIdParam });

export const createStatusSchema = z.object({
    params: projectIdParam,
    body: z.object({
        name: z.string().min(1),
        bgColor: z.string().optional(),
    }),
});

export const updateStatusSchema = z.object({
    params: statusIdParam,
    body: z.object({
        name: z.string().min(1).optional(),
        bgColor: z.string().optional(),
    }),
});

export const deleteStatusSchema = z.object({ params: statusIdParam });

export const reorderStatusesSchema = z.object({
    params: projectIdParam,
    body: z.object({
        orderedIds: z.array(
            z.string().regex(/^\d+$/).transform(BigInt)
        ).min(1),
    }),
});
