export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationResult<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface QueryParams extends PaginationParams {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any; // Cho phép thêm filters khác
}
