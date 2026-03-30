'use client';

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@/contexts/auth-context';

/**
 * Hook để truy cập auth state & methods.
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
