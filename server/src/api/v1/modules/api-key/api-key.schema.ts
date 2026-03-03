import { z } from "zod";

export const createClientKeySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
    })
});

export const listClientKeysQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['name', 'apiKey']).optional(),
        sortBy: z.enum(['name', 'apiKey', 'createdAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).passthrough() // Cho phép các fields khác không được định nghĩa
});

export type createClientKeyInput = z.infer<typeof createClientKeySchema>["body"];
export type listClientKeysQueryInput = z.infer<typeof listClientKeysQuerySchema>["query"];