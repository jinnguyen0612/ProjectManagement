import prisma from "../../../../infrastructure/libs/prisma";
import { AppError } from "../../../../core/errors/AppError";
import { hashPassword, comparePassword, compareToken } from "../../../../infrastructure/libs/bcrypt";
import { decodeToken, signAccessToken, signRefreshToken, storeRefreshToken } from "../../../../infrastructure/libs/jwt";
import { RegisterInput, LoginInput, VerifyRegisterInput, ResendOTPIput, RefreshTokenInput } from "./auth.schema";
import { UserStatus } from "../../../../core/types/User/user-status";
import { sendWelcomeEmail } from "../../../../infrastructure/services/email.service";
import { generateCode, generateOTP } from "../../../../core/utils/generate-code";
import { OtpType } from "../../../../core/enums/OtpType";
import { currentUserId } from "../../../../hooks/useAuth";
import { UserRole } from "../../../../core/enums/Role";

export class AuthService {
    static async register(data: RegisterInput) {
        const existingEmail = await prisma.users.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            throw new AppError("Email already exists", 409);
        }

        const existingPhone = await prisma.users.findUnique({
            where: { phone: data.phone },
        });

        if (existingPhone) {
            throw new AppError("Phone already exists", 409);
        }

        const { confirmPassword, ...userData } = data;
        const hashedPassword = await hashPassword(userData.password);

        const roleUser = await prisma.roles.findUnique({
            where: { name: UserRole.USER }
        });

        if (!roleUser) {
            throw new AppError("Default user role not found", 500);
        }

        // Tạo user và gắn role trong transaction
        const user = await prisma.$transaction(async (tx) => {
            // Tạo user
            const newUser = await tx.users.create({
                data: {
                    email: userData.email,
                    phone: userData.phone,
                    password: hashedPassword,
                    avatar: userData.avatar,
                    fullname: userData.fullname,
                    status: UserStatus.INACTIVE,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // Gắn role "user" cho user mới
            await tx.usersRoles.create({
                data: {
                    userId: newUser.id,
                    roleId: roleUser.id,
                }
            });

            return newUser;
        });

        const { password, ...userWithoutPassword } = user;
        const code = generateOTP(6);

        await prisma.otps.upsert({
            where: { email: user.email },
            update: { otp: code, expiredAt: new Date(Date.now() + 15 * 60 * 1000) },
            create: { email: user.email, otp: code, expiredAt: new Date(Date.now() + 15 * 60 * 1000) },
        });

        sendWelcomeEmail(userWithoutPassword.email!, userWithoutPassword.phone!, userWithoutPassword.fullname!, code);

        return userWithoutPassword;
    }

    private static async getUserRolesAndPermissions(userId: bigint) {
        const roles = await prisma.usersRoles.findMany({
            where: { userId },
            include: {
                role: {
                    include: {
                        rolesPermissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        const userPermissions = await prisma.usersPermissions.findMany({
            where: { userId },
            include: {
                permission: true
            }
        });

        const roleNames = roles.map(r => r.role.name);
        const rolePermissions = roles.flatMap(r =>
            r.role.rolesPermissions.map(rp => rp.permission.key)
        );

        const specificAccess = userPermissions
            .filter(up => !up.isDeny)
            .map(up => up.permission.key);

        const specificDeny = userPermissions
            .filter(up => up.isDeny)
            .map(up => up.permission.key);

        return {
            role: roleNames.length > 0 ? roleNames[0] : "user",
            permissions: {
                access: [...new Set([...rolePermissions, ...specificAccess])],
                deny: specificDeny
            }
        };
    }

    static async login(data: LoginInput, ipAddress?: string, userAgent?: string) {
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { email: data.username },
                    { phone: data.username },
                ],
                status: UserStatus.ACTIVE,
            },
        });

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        const isMatch = await comparePassword(data.password, user.password);

        if (!isMatch) {
            throw new AppError("Invalid credentials", 401);
        }

        const { role, permissions } = await this.getUserRolesAndPermissions(user.id);

        const accessToken = signAccessToken({
            userId: Number(user.id),
            role: role,
            permissions: permissions,
        });

        const refreshToken = signRefreshToken({
            userId: Number(user.id),
        });

        const hasLogin = await prisma.jwtTokens.findFirst({
            where: {
                userId: user.id,
                ipAddress: ipAddress,
                userAgent: userAgent,
                revokedAt: null,
            }
        });

        if (hasLogin) {
            await prisma.jwtTokens.delete({
                where: {
                    id: hasLogin.id,
                }
            });
        }

        await storeRefreshToken(user.id, refreshToken, ipAddress, userAgent);

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken, refreshToken };
    };

    static async resendOTP(data: ResendOTPIput) {
        const user = await prisma.users.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const code = generateOTP(6);

        await prisma.otps.upsert({
            where: { email: user.email },
            update: { otp: code, expiredAt: new Date(Date.now() + 15 * 60 * 1000) },
            create: { email: user.email, otp: code, expiredAt: new Date(Date.now() + 15 * 60 * 1000) },
        });

        if (data.type === OtpType.REGISTER) {
            sendWelcomeEmail(user.email!, user.phone!, user.fullname!, code);
        }

        return;
    };

    static async verifyRegister(data: VerifyRegisterInput, ipAddress?: string, userAgent?: string) {
        const user = await prisma.users.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const otp = await prisma.otps.findUnique({
            where: { email: user.email },
        });

        if (!otp) {
            throw new AppError("OTP not found", 404);
        }

        if (otp.otp !== data.otp) {
            throw new AppError("Invalid OTP", 400);
        }

        if (!otp.expiredAt || otp.expiredAt < new Date()) {
            throw new AppError("OTP expired", 400);
        }

        await prisma.users.update({
            where: { email: user.email },
            data: { status: UserStatus.ACTIVE },
        });

        await prisma.otps.delete({
            where: { email: user.email },
        });

        const { role, permissions } = await this.getUserRolesAndPermissions(user.id);

        const accessToken = signAccessToken({
            userId: Number(user.id),
            role: role,
            permissions: permissions,
        });

        const refreshToken = signRefreshToken({
            userId: Number(user.id),
        });

        await storeRefreshToken(user.id, refreshToken, ipAddress, userAgent);

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken, refreshToken };
    };

    static async refreshToken(data: RefreshTokenInput, ipAddress?: string, userAgent?: string) {
        const userId = decodeToken(data.accessToken)?.userId;

        if (!userId) {
            throw new AppError("Invalid access token", 401);
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const jwtToken = await prisma.jwtTokens.findFirst({
            where: {
                userId: userId,
                ipAddress: ipAddress,
                userAgent: userAgent,
                revokedAt: null,
            }
        });

        if (!jwtToken) {
            throw new AppError("Invalid refresh token", 401);
        }

        const isMatch = await compareToken(data.refreshToken, jwtToken.refreshTokenHash);

        if (!isMatch) {
            throw new AppError("Invalid refresh token", 401);
        }

        if(jwtToken.expiredAt && jwtToken.expiredAt < new Date()){
            await prisma.jwtTokens.deleteMany({
                where: {
                    userId: userId,
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                }
            });
            throw new AppError("Refresh token expired", 401);
        }

        const { role, permissions } = await this.getUserRolesAndPermissions(user.id);

        const accessToken = signAccessToken({
            userId: Number(user.id),
            role: role,
            permissions: permissions,
        });

        return { accessToken };
    };
}