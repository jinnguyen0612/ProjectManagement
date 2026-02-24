import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../core/config/env";
import { AccessTokenPayload, RefreshTokenPayload } from "../../core/types/jwt.type";
import prisma from "./prisma";
import { hashToken } from "./bcrypt";

const accessOptions: SignOptions = {
    expiresIn: env.ACCESS_TIMEOUT,
};

const refreshOptions: SignOptions = {
    expiresIn: env.REFRESH_TIMEOUT,
};

// --- Sign ---

export const signAccessToken = (payload: AccessTokenPayload) => {
    return jwt.sign(payload, env.ACCESS_SECRET, accessOptions);
};

export const signRefreshToken = (payload: RefreshTokenPayload) => {
    return jwt.sign(payload, env.REFRESH_SECRET, refreshOptions);
};

// --- Verify ---

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.REFRESH_SECRET) as RefreshTokenPayload;
};

// --- Decode ---

export const decodeToken = (token: string) => {
    return jwt.decode(token) as AccessTokenPayload | RefreshTokenPayload;
};

// --- Database (jwt_tokens) ---

export const storeRefreshToken = async (
    userId: bigint,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
) => {
    const refreshTokenHash = await hashToken(refreshToken);
    const decoded = jwt.decode(refreshToken) as { exp: number };
    const expiredAt = new Date(decoded.exp * 1000);

    return prisma.jwtTokens.create({
        data: {
            userId,
            refreshTokenHash,
            expiredAt,
            ipAddress: ipAddress ?? null,
            userAgent: userAgent ?? null,
            createdAt: new Date(),
        },
    });
};

export const findRefreshToken = async (refreshTokenHash: string) => {
    return prisma.jwtTokens.findUnique({
        where: { refreshTokenHash },
    });
};

export const revokeRefreshToken = async (id: bigint) => {
    return prisma.jwtTokens.update({
        where: { id },
        data: { revokedAt: new Date() },
    });
};

export const revokeAllUserTokens = async (userId: bigint) => {
    return prisma.jwtTokens.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
};