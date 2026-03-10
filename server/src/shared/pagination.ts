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
 * Hỗ trợ nhiều điều kiện cho 1 trường bằng cách thêm suffix vào key
 * Ví dụ: ?age_gte=18&age_lte=65 => age: { gte: 18, lte: 65 }
 */
export function buildWhereCondition(
    baseCondition: any,
    filters: Record<string, any>,
    filterConfig: Record<string, 'exact' | 'contains' | 'in' | 'number' | 'boolean'> = {}
): any {
    const whereCondition = { ...baseCondition };
    const fieldOperators: Record<string, any> = {};
    
    Object.keys(filters).forEach(key => {
        const value = filters[key];
        
        // Check nếu key có operator suffix (_gt, _gte, _lt, _lte, _not, _contains, _startsWith, _endsWith)
        const operatorMatch = key.match(/^(.+)_(gt|gte|lt|lte|not|contains|startsWith|endsWith|in)$/);
        
        if (operatorMatch) {
            // Key có operator: age_gte => field: age, operator: gte
            const [, fieldName, operator] = operatorMatch;
            
            if (!fieldOperators[fieldName]) {
                fieldOperators[fieldName] = {};
            }
            
            // Parse value theo operator
            if (operator === 'in') {
                const values = Array.isArray(value) ? value : value.split(',');
                fieldOperators[fieldName][operator] = values;
            } else if (operator === 'contains' || operator === 'startsWith' || operator === 'endsWith') {
                fieldOperators[fieldName][operator] = value;
                fieldOperators[fieldName]['mode'] = 'insensitive';
            } else if (operator === 'gt' || operator === 'gte' || operator === 'lt' || operator === 'lte') {
                fieldOperators[fieldName][operator] = isNaN(value) ? value : Number(value);
            } else {
                fieldOperators[fieldName][operator] = value;
            }
        } else {
            // Key không có operator, xử lý theo filterConfig
            const type = filterConfig[key] || 'exact';
            
            switch (type) {
                case 'contains':
                    whereCondition[key] = {
                        contains: value,
                        mode: 'insensitive',
                    };
                    break;
                    
                case 'in':
                    const values = Array.isArray(value) ? value : value.split(',');
                    whereCondition[key] = {
                        in: values,
                    };
                    break;
                    
                case 'number':
                    whereCondition[key] = parseInt(value);
                    break;
                    
                case 'boolean':
                    whereCondition[key] = value === 'true' || value === true;
                    break;
                    
                case 'exact':
                default:
                    whereCondition[key] = value;
                    break;
            }
        }
    });
    
    // Merge fieldOperators vào whereCondition
    Object.keys(fieldOperators).forEach(fieldName => {
        whereCondition[fieldName] = fieldOperators[fieldName];
    });
    
    return whereCondition;
}
