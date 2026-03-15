import { z } from "zod";

export const createClientKeySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
    }),
});

export const listClientKeysQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['name', 'apiKey']).optional(),
        sortBy: z.enum(['name', 'apiKey', 'createdAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional().default({}),
});

export const deleteClientKeySchema = z.object({
    params: z.object({
        id: z.string()
            .regex(/^\d+$/, "ID must be a number")
            .transform((val) => BigInt(val))
            .refine((v) => v > 0n, "Invalid ID"),
    }),
});

// Types
export type createClientKeyInput = z.infer<typeof createClientKeySchema>["body"];
export type listClientKeysQueryInput = z.infer<typeof listClientKeysQuerySchema>["query"];
export type deleteClientKeyParams = z.infer<typeof deleteClientKeySchema>["params"];
