import Cookies from 'js-cookie';
import apiClient, { clearAuthCookies } from './axios-instance';
import { ApiResponse } from '@/types/api';
import { AuthUser, LoginCredentials, LoginResponse } from '@/types/auth';

/* ------------------------------------------------------------------ */
/*  Auth Service                                                       */
/* ------------------------------------------------------------------ */

export const authService = {
    /**
     * Login → save tokens to cookies → return user + payload.
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/login',
            credentials
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Login failed');
        }

        const { accessToken, refreshToken, user } = data.data;

        // Save tokens
        Cookies.set('accessToken', accessToken, { path: '/' });
        Cookies.set('refreshToken', refreshToken, { path: '/' });

        return data.data;
    },

    /**
     * Logout → call API → clear cookies.
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch {
            // Dù API lỗi vẫn clear cookies
        } finally {
            clearAuthCookies();
        }
    },

    /**
     * Refresh access token.
     */
    async refreshToken(): Promise<string> {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (!accessToken || !refreshToken) {
            throw new Error('No tokens found');
        }

        const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
            '/auth/refresh-token',
            { accessToken, refreshToken }
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Refresh failed');
        }

        Cookies.set('accessToken', data.data.accessToken, { path: '/' });
        return data.data.accessToken;
    },

    /**
     * Get current user profile.
     */
    async getProfile(): Promise<AuthUser> {
        const { data } = await apiClient.get<ApiResponse<AuthUser>>('/profile');

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Get profile failed');
        }

        return data.data;
    },
};
