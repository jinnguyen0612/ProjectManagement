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
        isCompleted: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
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

export const moveTaskSchema = z.object({
    params: taskIdParam,
    body: z.object({
        // ID của status đích (bắt buộc, có thể giống status cũ nếu chỉ reorder)
        newStatusId: z.string().regex(/^\d+$/).transform(BigInt),
        // Ordered task IDs của status đích sau khi drop (bao gồm task được kéo)
        targetOrderedIds: z.array(z.string().regex(/^\d+$/).transform(BigInt)).min(1),
        // Ordered task IDs của status nguồn sau khi bỏ task ra (không bao gồm task được kéo)
        // Bỏ qua nếu kéo trong cùng 1 status
        sourceOrderedIds: z.array(z.string().regex(/^\d+$/).transform(BigInt)).optional(),
    }),
});
