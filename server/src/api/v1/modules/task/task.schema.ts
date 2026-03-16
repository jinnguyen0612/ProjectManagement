import { z } from "zod";

const projectIdParam = z.object({
    id: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
});

const taskIdParam = z.object({
    id: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
    taskId: z.string().regex(/^\d+$/).transform(BigInt).refine(v => v > 0n),
});

export const getTasksSchema = z.object({
    params: projectIdParam,
    query: z.object({
        statusId: z.string().regex(/^\d+$/).transform(BigInt).optional(),
        memberId: z.string().regex(/^\d+$/).transform(BigInt).optional(),
    }).optional().default({}),
});

export const getTaskDetailSchema = z.object({ params: taskIdParam });

export const createTaskSchema = z.object({
    params: projectIdParam,
    body: z.object({
        name: z.string().min(1).max(500),
        description: z.string().optional(),
        statusId: z.string().regex(/^\d+$/).transform(BigInt),
        bgColor: z.string().optional(),
        dateStart: z.string().datetime().transform(v => new Date(v)).optional(),
        dateEnd: z.string().datetime().transform(v => new Date(v)).optional(),
    }),
});

export const updateTaskSchema = z.object({
    params: taskIdParam,
    body: z.object({
        name: z.string().min(1).max(500).optional(),
        description: z.string().nullable().optional(),
        statusId: z.string().regex(/^\d+$/).transform(BigInt).optional(),
        bgColor: z.string().optional(),
        dateStart: z.string().datetime().transform(v => new Date(v)).nullable().optional(),
        dateEnd: z.string().datetime().transform(v => new Date(v)).nullable().optional(),
        position: z.string().regex(/^\d+$/).transform(BigInt).optional(),
    }),
});

export const completeTaskSchema = z.object({ params: taskIdParam });

export const changeTaskStatusSchema = z.object({
    params: taskIdParam,
    body: z.object({
        statusId: z.string().regex(/^\d+$/).transform(BigInt),
    }),
});

export const assignMembersSchema = z.object({
    params: taskIdParam,
    body: z.object({
        memberIds: z.array(z.string().regex(/^\d+$/).transform(BigInt)).min(0),
    }),
});
