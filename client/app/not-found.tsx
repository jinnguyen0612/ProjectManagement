import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="not-found">
            <p className="not-found__code">404</p>
            <h1 className="not-found__title">Không tìm thấy trang</h1>
            <p className="not-found__description">
                Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Link href="/dashboard" className="not-found__link">
                <ArrowLeft size={18} />
                Về trang chủ
            </Link>
        </div>
    );
}
