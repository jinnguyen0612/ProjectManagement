'use client';

import AuthGuard from '@/lib/auth-guard';
import { UserRole } from '@/types/auth';

export default function UsersPage() {
    return (
        <AuthGuard requiredRoles={[UserRole.ADMIN]}>
            <div className="page-card">
                <h1 className="page-card__title">Quản lý người dùng</h1>
                <p className="page-card__description">
                    Trang này chỉ dành cho Admin. Quản lý danh sách người dùng, phân quyền và trạng thái.
                </p>
            </div>
        </AuthGuard>
    );
}
