'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const callbackUrl = searchParams.get('callbackUrl') || ROUTES.DASHBOARD;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        // Tránh submit nhiều lần
        if (isSubmitting) return;

        if (!username.trim() || !password.trim()) {
            toast.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (password.length < 6) {
            toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsSubmitting(true);

        try {
            await login({ username: username.trim(), password });
            toast.success('Đăng nhập thành công!');
            router.push(callbackUrl);
        } catch (err: any) {
            const message =
                err?.response?.data?.message || err?.message || 'Đăng nhập thất bại';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__header">
                <div className="login-form__logo">
                    <div className="login-form__logo-icon">
                        <Image src="/images/logo-white.png" alt="Logo" width={100} height={100} />
                    </div>
                </div>
                <h1 className="login-form__title">Đăng nhập</h1>
                <p className="login-form__subtitle">Project Management System</p>
            </div>

            <div className="login-form__field">
                <label htmlFor="login-username" className="login-form__label">
                    Email hoặc Số điện thoại
                </label>
                <div className="login-form__input-wrapper">
                    <User size={18} className="login-form__input-icon" />
                    <input
                        id="login-username"
                        type="text"
                        className="login-form__input"
                        placeholder="email@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="login-form__field">
                <label htmlFor="login-password" className="login-form__label">
                    Mật khẩu
                </label>
                <div className="login-form__input-wrapper">
                    <Lock size={18} className="login-form__input-icon" />
                    <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        className="login-form__input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={isSubmitting}
                    />
                    <button
                        type="button"
                        className="login-form__toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button
                id="login-submit"
                type="submit"
                className="login-form__submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <span className="login-form__submit-loading">
                        <span className="spinner spinner--small" />
                        Đang đăng nhập...
                    </span>
                ) : (
                    'Đăng nhập'
                )}
            </button>
        </form>
    );
}
