'use client';

import AuthGuard from '@/lib/auth-guard';
import { UserRole } from '@/types/auth';

export default function SettingsPage() {
    return (
        <AuthGuard requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <div className="page-card">
                <h1 className="page-card__title">Cài đặt hệ thống</h1>
                <p className="page-card__description">
                    Trang này dành cho Admin và Manager. Cấu hình các thiết lập hệ thống.
                </p>
            </div>
        </AuthGuard>
    );
}
