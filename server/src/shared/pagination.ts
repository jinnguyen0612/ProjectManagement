import { PaginationResult, PaginationMeta } from "../core/types/pagination.type";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const DEFAULT_SORT_ORDER = 'desc';

/**
 * Parse và validate query params (pagination + search + sort)
 */
export function parseQueryParams(query: any): {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
} {
    const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;
    
    // Giới hạn limit tối đa
    limit = Math.min(limit, MAX_LIMIT);
    limit = Math.max(1, limit);
    
    const skip = (page - 1) * limit;
    const search = query.search ? String(query.search).trim() : undefined;
    const sortBy = query.sortBy ? String(query.sortBy) : undefined;
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    
    return { page, limit, skip, search, sortBy, sortOrder };
}

/**
 * Parse pagination params only (không có search/sort)
 */
export function parsePaginationParams(query: any): { page: number; limit: number; skip: number } {
    const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;
    
    limit = Math.min(limit, MAX_LIMIT);
    limit = Math.max(1, limit);
    
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
}

/**
 * Tạo pagination metadata
 */
export function createPaginationMeta(
    total: number,
    page: number,
    limit: number
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

/**
 * Tạo response pagination
 */
export function createPaginationResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResult<T> {
    return {
        data,
        pagination: createPaginationMeta(total, page, limit),
    };
}


/**
 * Parse query params với filters (hỗ trợ multiple filters)
 * Ví dụ: ?username=abc&role=admin&status=active
 */
export function parseQueryParamsWithFilters(
    query: any,
    allowedFilters: string[] = []
): {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    searchField?: string;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    filters: Record<string, any>;
} {
    const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;
    
    limit = Math.min(limit, MAX_LIMIT);
    limit = Math.max(1, limit);
    
    const skip = (page - 1) * limit;
    const search = query.search ? String(query.search).trim() : undefined;
    const searchField = query.searchField ? String(query.searchField) : undefined;
    const sortBy = query.sortBy ? String(query.sortBy) : undefined;
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Parse filters từ query params
    const filters: Record<string, any> = {};
    allowedFilters.forEach(filterKey => {
        if (query[filterKey] !== undefined && query[filterKey] !== '') {
            filters[filterKey] = query[filterKey];
        }
    });
    
    return { page, limit, skip, search, searchField, sortBy, sortOrder, filters };
}

/**
 * Build Prisma where condition từ filters
 */
export function buildWhereCondition(
    baseCondition: any,
    filters: Record<string, any>,
    filterConfig: Record<string, 'exact' | 'contains' | 'in' | 'number' | 'boolean'> = {}
): any {
    const whereCondition = { ...baseCondition };
    
    Object.keys(filters).forEach(key => {
        const value = filters[key];
        const type = filterConfig[key] || 'exact';
        
        switch (type) {
            case 'contains':
                // Text search với LIKE
                whereCondition[key] = {
                    contains: value,
                    mode: 'insensitive',
                };
                break;
                
            case 'in':
                // Array values (ví dụ: role=admin,user)
                const values = Array.isArray(value) ? value : value.split(',');
                whereCondition[key] = {
                    in: values,
                };
                break;
                
            case 'number':
                // Number comparison
                whereCondition[key] = parseInt(value);
                break;
                
            case 'boolean':
                // Boolean values
                whereCondition[key] = value === 'true' || value === true;
                break;
                
            case 'exact':
            default:
                // Exact match
                whereCondition[key] = value;
                break;
        }
    });
    
    return whereCondition;
}
