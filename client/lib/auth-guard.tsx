'use client';

import { notFound } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';
import { hasRole, hasPermission } from '@/lib/permission-logic';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface AuthGuardProps {
    children: React.ReactNode;
    /** Roles được phép truy cập. Rỗng = tất cả authenticated */
    requiredRoles?: UserRole[];
    /** Permission keys cần thiết */
    requiredPermissions?: string[];
}

/**
 * Component guard: wrap page content, check role/permission.
 * Nếu không có quyền → trigger Next.js notFound() → render 404 page.
 *
 * @example
 * <AuthGuard requiredRoles={[UserRole.ADMIN]}>
 *   <AdminPageContent />
 * </AuthGuard>
 */
export default function AuthGuard({
    children,
    requiredRoles = [],
    requiredPermissions = [],
}: AuthGuardProps) {
    const { tokenPayload, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullscreen />;
    }

    if (!isAuthenticated || !tokenPayload) {
        // Middleware đã redirect, nhưng double-check
        return null;
    }

    // Check role
    if (requiredRoles.length > 0 && !hasRole(tokenPayload.role, requiredRoles)) {
        notFound();
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
        const hasAll = requiredPermissions.every((perm) =>
            hasPermission(tokenPayload.role, tokenPayload.permissions, perm)
        );
        if (!hasAll) {
            notFound();
        }
    }

    return <>{children}</>;
}
