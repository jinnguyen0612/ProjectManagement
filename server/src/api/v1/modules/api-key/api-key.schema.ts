import { z } from "zod";

// Schema cho tạo API key
export const createClientKeySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
    })
});

// Schema cho list API keys với query params
export const listClientKeysQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        searchField: z.enum(['name', 'apiKey']).optional(),
        sortBy: z.enum(['name', 'apiKey', 'createdAt']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }).passthrough()
});

// Schema cho delete API key với params
export const deleteClientKeySchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    })
});

// Types
export type createClientKeyInput = z.infer<typeof createClientKeySchema>["body"];
export type listClientKeysQueryInput = z.infer<typeof listClientKeysQuerySchema>["query"];
export type deleteClientKeyParams = z.infer<typeof deleteClientKeySchema>["params"];