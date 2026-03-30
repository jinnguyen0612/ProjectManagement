'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';
import { hasRole, hasPermission } from './permission-logic';

interface CanProps {
    children: ReactNode;
    roles?: UserRole[];
    permissions?: string[];
    fallback?: ReactNode; // Nội dung hiển thị nếu không có quyền (mặc định là null)
}

/**
 * Component giúp hiển thị nội dung có điều kiện dựa theo Role hoặc Permission.
 */
export default function Can({ children, roles, permissions, fallback = null }: CanProps) {
    const { tokenPayload, isAuthenticated } = useAuth();

    if (!isAuthenticated || !tokenPayload) {
        return <>{fallback}</>;
    }

    // Kiểm tra Role (nếu có yêu cầu)
    if (roles && roles.length > 0) {
        if (!hasRole(tokenPayload.role, roles)) {
            return <>{fallback}</>;
        }
    }

    // Kiểm tra Permission (nếu có yêu cầu)
    if (permissions && permissions.length > 0) {
        const hasAll = permissions.every((p) => hasPermission(tokenPayload.role, tokenPayload.permissions, p));
        if (!hasAll) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
}
