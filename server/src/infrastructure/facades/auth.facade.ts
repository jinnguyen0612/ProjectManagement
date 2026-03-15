import prisma from "../libs/prisma";

export class AuthFacade {
    static findOtpByEmail(email: string) {
        return prisma.otps.findUnique({ where: { email } });
    }

    static upsertOtp(email: string, otp: string, expiredAt: Date) {
        return prisma.otps.upsert({
            where: { email },
            update: { otp, expiredAt },
            create: { email, otp, expiredAt },
        });
    }

    static deleteOtp(email: string) {
        return prisma.otps.delete({ where: { email } });
    }

    static findJwtToken(userId: bigint, ipAddress?: string, userAgent?: string) {
        return prisma.jwtTokens.findFirst({
            where: { userId, ipAddress, userAgent, revokedAt: null },
        });
    }

    static deleteJwtToken(id: bigint) {
        return prisma.jwtTokens.delete({ where: { id } });
    }

    static deleteJwtTokensByDevice(userId: bigint, ipAddress?: string, userAgent?: string) {
        return prisma.jwtTokens.deleteMany({ where: { userId, ipAddress, userAgent } });
    }
}
