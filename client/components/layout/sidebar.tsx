'use client';

import { useAuth } from '@/hooks/use-auth';
import { getFilteredMenu } from '@/config/menu';
import { ArrowLeftToLine, Boxes } from 'lucide-react';
import SidebarLink from './sidebar-link';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function Sidebar() {
    const { tokenPayload } = useAuth();
    const role = tokenPayload?.role || 'user';
    const menuItems = getFilteredMenu(tokenPayload);

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar__header">
                <Link href="/dashboard">
                    <div className="sidebar__logo">
                        <div className="sidebar__logo-icon">
                            <Image src="/images/logo-white.png" alt="Logo" width={100} height={100} />
                        </div>
                        <span className="sidebar__brand">PM System</span>
                    </div>
                </Link>
                <Button className='bg-transparent hover:bg-transparent hover:text-white' variant={'default'} size="icon" onClick={() => { }}>
                    <ArrowLeftToLine size={24} />
                </Button>
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
