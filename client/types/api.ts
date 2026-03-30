export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}
