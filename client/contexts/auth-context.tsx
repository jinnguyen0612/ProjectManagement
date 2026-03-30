'use client';

import {
    createContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { AuthUser, AccessTokenPayload } from '@/types/auth';
import { LoginCredentials } from '@/types/auth';
import { authService } from '@/services/auth-service';
import { decodeAccessToken, isTokenExpired } from '@/lib/jwt-helper';

/* ------------------------------------------------------------------ */
/*  Context type                                                       */
/* ------------------------------------------------------------------ */

export interface AuthContextType {
    user: AuthUser | null;
    tokenPayload: AccessTokenPayload | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [tokenPayload, setTokenPayload] = useState<AccessTokenPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!tokenPayload;

    /* ---- Khởi tạo: đọc token từ cookie ---- */
    const initAuth = useCallback(() => {
        const token = Cookies.get('accessToken');

        if (!token || isTokenExpired(token)) {
            setUser(null);
            setTokenPayload(null);
            setIsLoading(false);
            return;
        }

        const payload = decodeAccessToken(token);
        setTokenPayload(payload);

        // Load profile nếu chưa có user
        authService
            .getProfile()
            .then(setUser)
            .catch(() => {
                setUser(null);
                setTokenPayload(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    /* ---- Login ---- */
    const login = useCallback(async (credentials: LoginCredentials) => {
        const result = await authService.login(credentials);
        setUser(result.user);

        const payload = decodeAccessToken(result.accessToken);
        setTokenPayload(payload);
    }, []);

    /* ---- Logout ---- */
    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setTokenPayload(null);
        window.location.href = '/login';
    }, []);

    /* ---- Refresh (re-read cookie) ---- */
    const refreshAuth = useCallback(() => {
        initAuth();
    }, [initAuth]);

    return (
        <AuthContext.Provider
            value={{
                user,
                tokenPayload,
                isAuthenticated,
                isLoading,
                login,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
