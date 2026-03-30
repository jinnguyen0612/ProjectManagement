import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đăng nhập - PM System',
    description: 'Đăng nhập vào hệ thống quản lý dự án',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="auth-layout">
            {children}
        </div>
    );
}
