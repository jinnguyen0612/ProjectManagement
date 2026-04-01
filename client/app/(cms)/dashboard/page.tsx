'use client';

import { useAuth } from '@/hooks/use-auth';
import { FolderKanban, CheckSquare, Users, Clock } from 'lucide-react';

export default function DashboardPage() {
    const { user, tokenPayload } = useAuth();

    return (
        <div>
            <div className="page-card" style={{ marginBottom: '24px' }}>
                <h1 className="page-card__title">
                    Xin chào, {user?.fullname || 'User'} 👋
                </h1>
                <p className="page-card__description">
                    Chào mừng bạn trở lại hệ thống quản lý dự án.
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--purple">
                        <FolderKanban size={22} />
                    </div>
                    <p className="stat-card__label">Dự án</p>
                    <p className="stat-card__value">—</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green">
                        <CheckSquare size={22} />
                    </div>
                    <p className="stat-card__label">Công việc</p>
                    <p className="stat-card__value">—</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--blue">
                        <Users size={22} />
                    </div>
                    <p className="stat-card__label">Thành viên</p>
                    <p className="stat-card__value">—</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--amber">
                        <Clock size={22} />
                    </div>
                    <p className="stat-card__label">Role hiện tại</p>
                    <p className="stat-card__value" style={{ fontSize: '20px', textTransform: 'capitalize' }}>
                        {tokenPayload?.role || 'user'}
                    </p>
                </div>
            </div>
        </div>
    );
}
