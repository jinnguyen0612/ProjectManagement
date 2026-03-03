import { z } from "zod";

// Whitelist các fields được phép search
export const searchableFields = ['name', 'apiKey'] as const;
export type SearchableField = typeof searchableFields[number];

export const listClientKeysQuerySchema = z.object({
    // Pagination
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    
    // Search
    search: z.string().optional(),
    searchField: z.enum(searchableFields).optional(),
    
    // Sort
    sortBy: z.enum(['name', 'apiKey', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListClientKeysQuery = z.infer<typeof listClientKeysQuerySchema>;
