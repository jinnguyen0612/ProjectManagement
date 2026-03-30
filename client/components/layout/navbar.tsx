'use client';

import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, tokenPayload, logout } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar__left">
                <h2 className="navbar__title">Dashboard</h2>
            </div>

            <div className="navbar__right">
                {/* User info */}
                <div className="navbar__user">
                    <div className="navbar__avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.fullname} className="navbar__avatar-img" />
                        ) : (
                            <span className="navbar__avatar-fallback">
                                {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="navbar__user-info">
                        <span className="navbar__user-name">{user?.fullname || 'User'}</span>
                        <span className="navbar__user-role">{tokenPayload?.role || 'user'}</span>
                    </div>
                </div>

                {/* Logout */}
                <button
                    id="logout-button"
                    className="navbar__logout"
                    onClick={logout}
                    title="Đăng xuất"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
