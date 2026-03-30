import { UserRole, Permissions, AccessTokenPayload } from '@/types/auth';
import { getRouteConfig } from '@/config/routes';

/**
 * Kiểm tra user có role nằm trong danh sách required hay không.
 * Nếu requiredRoles rỗng → pass (chỉ cần authenticated).
 */
export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole as UserRole);
}

import rolePermissionsData from '@/config/permissions.json';

const ROLE_PERMISSIONS: Record<string, string[]> = rolePermissionsData;

/**
 * Kiểm tra user có quyền cụ thể hay không.
 * Logic mới:
 * 1. Nếu bị DENY đặc biệt (trong JWT) -> KHÔNG (Ưu tiên cao nhất)
 * 2. Nếu được GRANT đặc biệt (trong JWT) -> CÓ
 * 3. Nếu quyền đó nằm trong bộ quyền mặc định của ROLE (trong JSON) -> CÓ
 */
export function hasPermission(
    userRole: string,
    permissions: Permissions,
    requiredPermission: string
): boolean {
    // 1. Phải ưu tiên kiểm tra DENY trước (Quyền bị tước bỏ)
    if (permissions.deny.includes(requiredPermission)) return false;

    // 2. Kiểm tra ACCESS đặc biệt (Quyền được cấp thêm ngoài Role)
    if (permissions.access.includes(requiredPermission)) return true;

    // 3. Kiểm tra quyền mặc định của Role từ file JSON
    const basePermissions = ROLE_PERMISSIONS[userRole] || [];
    return basePermissions.includes(requiredPermission);
}

/**
 * Kiểm tra user có quyền truy cập route hay không.
 * Kết hợp role check + route config.
 *
 * @returns true nếu được phép, false nếu không.
 */
export function canAccessRoute(
    payload: AccessTokenPayload | null,
    pathname: string
): boolean {
    // Chưa login → không
    if (!payload) return false;

    const routeConfig = getRouteConfig(pathname);

    // Không có config đặc biệt → chỉ cần authenticated
    if (!routeConfig) return true;

    // Check role
    if (routeConfig.roles.length > 0) {
        if (!hasRole(payload.role, routeConfig.roles)) return false;
    }

    // Check permissions
    if (routeConfig.permissions && routeConfig.permissions.length > 0) {
        const hasAllPermissions = routeConfig.permissions.every((perm) =>
            hasPermission(payload.role, payload.permissions, perm)
        );
        if (!hasAllPermissions) return false;
    }

    return true;
}
