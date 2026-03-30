'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/config/routes';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            router.replace(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN);
        }
    }, [isAuthenticated, isLoading, router]);

    return <LoadingSpinner fullscreen />;
}
