export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    USER = 'user',
}

export interface Permissions {
    access: string[];
    deny: string[];
}

export interface AccessTokenPayload {
    userId: number;
    role: string;
    permissions: Permissions;
    exp?: number;
    iat?: number;
}

export interface AuthUser {
    id: number;
    email: string;
    fullname: string;
    phone?: string | null;
    avatar?: string | null;
    bio?: string | null;
    address?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface AuthState {
    user: AuthUser | null;
    tokenPayload: AccessTokenPayload | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
