'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, Settings, type LucideIcon } from 'lucide-react';

interface SidebarLinkProps {
    href: string;
    icon: string;
    label: string;
}

const ICONS: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    projects: FolderKanban,
    users: Users,
    settings: Settings,
};

export default function SidebarLink({ href, icon, label }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    const IconComponent = ICONS[icon] || LayoutDashboard;

    return (
        <Link href={href} className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <span className="sidebar__link-icon">
                <IconComponent size={20} />
            </span>
            <span className="sidebar__link-label">{label}</span>
            {isActive && <span className="sidebar__link-indicator" />}
        </Link>
    );
}
