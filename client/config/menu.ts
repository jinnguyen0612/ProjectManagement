import { UserRole } from '@/types/auth';
import menuData from './menu.json';

/* ------------------------------------------------------------------ */
/*  Menu item types                                                    */
/* ------------------------------------------------------------------ */

export interface MenuItem {
    label: string;
    href: string;
    icon: string;
    roles?: string[]; // Optional roles
    permissions?: string[]; // Optional permissions
    children?: MenuItem[];
}

/* ------------------------------------------------------------------ */
/*  Sidebar menu configuration                                         */
/* ------------------------------------------------------------------ */

export const MENU_ITEMS: MenuItem[] = menuData as MenuItem[];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

import { AccessTokenPayload } from '@/types/auth';
import { hasRole, hasPermission } from '@/lib/permission-logic';

/**
 * Kiểm tra xem user có quyền xem menu item này không.
 * - Ưu tiên permissions nếu có.
 * - Nếu không có permissions, check roles.
 * - Nếu cả 2 đều trống -> ai cũng thấy.
 */
export function canAccessMenuItem(
    item: MenuItem,
    payload: AccessTokenPayload | null
): boolean {
    if (!payload) return false;

    // 1. Check permissions first (nếu item yêu cầu permission cụ thể)
    if (item.permissions && item.permissions.length > 0) {
        // Hợp lệ nếu user có ÍT NHẤT 1 permission trong danh sách (OR logic)
        return item.permissions.some((perm) =>
            hasPermission(payload.role, payload.permissions, perm)
        );
    }

    // 2. Check roles (nếu item không có permission nhưng có roles)
    if (item.roles && item.roles.length > 0) {
        return hasRole(payload.role, item.roles as UserRole[]);
    }

    // 3. Không yêu cầu gì -> pass
    return true;
}

/**
 * Filter menu items theo payload hiện tại (role + permissions).
 */
export function getFilteredMenu(payload: AccessTokenPayload | null): MenuItem[] {
    if (!payload) return [];

    return MENU_ITEMS.reduce((acc: MenuItem[], item) => {
        const canAccess = canAccessMenuItem(item, payload);

        if (canAccess) {
            // Nếu có con, lọc con trước khi add vào list mới
            const filteredChildren = item.children
                ? item.children.filter((child) => canAccessMenuItem(child, payload))
                : undefined;

            acc.push({
                ...item,
                children: filteredChildren,
            });
        }

        return acc;
    }, []);
}
