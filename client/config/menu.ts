import { UserRole } from '@/types/auth';
import { ROUTES } from './routes';

/* ------------------------------------------------------------------ */
/*  Menu item types                                                    */
/* ------------------------------------------------------------------ */

export interface MenuItem {
    label: string;
    href: string;
    icon: string;       // icon name (sẽ render bằng component)
    /** Nếu empty → tất cả roles đều thấy */
    roles: UserRole[];
    /** Sub-menu items */
    children?: MenuItem[];
}

/* ------------------------------------------------------------------ */
/*  Sidebar menu configuration                                         */
/* ------------------------------------------------------------------ */

export const MENU_ITEMS: MenuItem[] = [
    {
        label: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: 'dashboard',
        roles: [],
    },
    {
        label: 'Dự án',
        href: ROUTES.PROJECTS,
        icon: 'projects',
        roles: [],
    },
    {
        label: 'Người dùng',
        href: ROUTES.USERS,
        icon: 'users',
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Cài đặt',
        href: ROUTES.SETTINGS,
        icon: 'settings',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

/**
 * Filter menu items theo role hiện tại.
 * Item.roles rỗng = ai cũng thấy.
 */
export function getMenuForRole(role: string): MenuItem[] {
    return MENU_ITEMS.filter(
        (item) => item.roles.length === 0 || item.roles.includes(role as UserRole)
    );
}
