import { UserRole } from '@/types/auth';

/* ------------------------------------------------------------------ */
/*  Route path constants                                               */
/* ------------------------------------------------------------------ */

export const ROUTES = {
    // Auth
    LOGIN: '/login',

    // Dashboard
    DASHBOARD: '/dashboard',
    PROJECTS: '/dashboard/projects',
    USERS: '/dashboard/users',
    SETTINGS: '/dashboard/settings',
} as const;

/* ------------------------------------------------------------------ */
/*  Route → required roles mapping                                     */
/* ------------------------------------------------------------------ */

export interface RouteConfig {
    /** Nếu empty array → tất cả authenticated users đều vào được */
    roles: UserRole[];
    /** Permission keys nếu muốn check permission thay vì role */
    permissions?: string[];
}

/**
 * Map path prefix → required roles.
 * - Được check theo thứ tự dài nhất match trước (most specific first).
 * - Nếu path không có trong map → chỉ cần authenticated là đủ.
 */
const ROUTE_CONFIGS: Record<string, RouteConfig> = {
    '/dashboard/users': {
        roles: [UserRole.ADMIN],
    },
    '/dashboard/settings': {
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    // '/dashboard/projects' → không có ở đây → mọi user authenticated đều vào được
    // '/dashboard' → cũng vậy
};

/**
 * Lấy RouteConfig cho 1 pathname, sort theo longest prefix match.
 * Return null nếu không có config đặc biệt (chỉ cần auth).
 */
export function getRouteConfig(pathname: string): RouteConfig | null {
    const entries = Object.entries(ROUTE_CONFIGS)
        .sort((a, b) => b[0].length - a[0].length); // longest first

    for (const [prefix, config] of entries) {
        if (pathname.startsWith(prefix)) {
            return config;
        }
    }

    return null;
}

/* ------------------------------------------------------------------ */
/*  Public / Auth routes (không cần login)                             */
/* ------------------------------------------------------------------ */

export const PUBLIC_ROUTES = ['/login', '/register', '/verify'];
export const AUTH_ROUTES = ['/login', '/register']; // redirect to dashboard if already logged in
