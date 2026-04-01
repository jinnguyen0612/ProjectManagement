'use client';

import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullscreen />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-layout__main">
                <Navbar />
                <main className="dashboard-layout__content">
                    {children}
                </main>
            </div>
        </div>
    );
}
