export interface SearchOptions {
    term?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
    [key: string]: any;
}

export interface AdvancedSearchOptions {
    // Text search
    search?: string;
    searchField?: string;
    
    // Filters
    filters?: SearchFilters;
    
    // Pagination
    page?: number;
    limit?: number;
    
    // Sort
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
