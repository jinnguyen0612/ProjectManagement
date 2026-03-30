import { decodeJwt } from 'jose';
import { AccessTokenPayload } from '@/types/auth';

/**
 * Decode access token (không verify signature — middleware đã verify).
 * Chỉ dùng phía client để đọc payload.
 */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
    try {
        const payload = decodeJwt(token) as unknown as AccessTokenPayload;
        return payload;
    } catch {
        return null;
    }
}

/**
 * Kiểm tra token đã hết hạn chưa (dựa vào claim `exp`).
 */
export function isTokenExpired(token: string): boolean {
    try {
        const payload = decodeJwt(token);
        if (!payload.exp) return false;
        // Thêm buffer 30 giây
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now + 30;
    } catch {
        return true;
    }
}

/**
 * Lấy typed payload từ token.
 */
export function getTokenPayload(token: string): AccessTokenPayload | null {
    return decodeAccessToken(token);
}
