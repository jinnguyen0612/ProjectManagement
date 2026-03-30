'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <LoginForm />
        </Suspense>
    );
}
