export interface TokenPermissions {
  access: string[];
  deny: string[];
}

export interface AccessTokenPayload {
  userId: number;
  role: string;
  permissions: TokenPermissions;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT mà không verify signature.
 * Chỉ dùng để đọc payload ở client — không dùng để xác thực bảo mật.
 */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeAccessToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
