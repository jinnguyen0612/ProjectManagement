'use client';

import { useAuth } from '@/hooks/use-auth';
import { getMenuForRole } from '@/config/menu';
import { Boxes } from 'lucide-react';
import SidebarLink from './sidebar-link';

export default function Sidebar() {
    const { tokenPayload } = useAuth();
    const role = tokenPayload?.role || 'user';
    const menuItems = getMenuForRole(role);

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar__header">
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">
                        <Boxes size={24} />
                    </div>
                    <span className="sidebar__brand">PM System</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar__nav">
                <div className="sidebar__nav-label">MENU</div>
                {menuItems.map((item) => (
                    <SidebarLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                    />
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar__footer">
                <div className="sidebar__role-badge">
                    {role.toUpperCase()}
                </div>
            </div>
        </aside>
    );
}
