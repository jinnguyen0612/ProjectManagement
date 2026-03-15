import { getUserContext } from "./useUserContext";
import { AppError } from "../core/errors/app-error";
import prisma from "../infrastructure/libs/prisma";
import { Prisma } from "@prisma/client";
import { UserRole } from "../core/enums/role";
import { UserWithRoles } from "../core/types/user-with-role";

/**
 * Lấy ID của người dùng đang đăng nhập từ context.
 * Thống lỗi nếu không tìm thấy thông tin đăng nhập.
 */
export const currentUserId = (): number => {
    const context = getUserContext();
    if (!context || !context.userId) {
        throw new AppError("Unauthorized: User session not found", 401);
    }
    return context.userId;
};

/**
 * Lấy thông tin chi tiết (entity) của người dùng đang đăng nhập từ database.
 * Thống lỗi nếu không tìm thấy người dùng hoặc chưa đăng nhập.
 */
export const currentUser = async () => {
    const userId = currentUserId();
    const user = await prisma.users.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Lấy thông tin user với relations tùy chỉnh
 * @param include - Prisma include object để chỉ định relations cần lấy
 * @example
 * // Lấy user với roles
 * const user = await currentUserWith({
 *   usersRoles: { include: { role: true } }
 * });
 * 
 * // Lấy user với projects và members
 * const user = await currentUserWith({
 *   projectsOwned: true,
 *   members: { include: { project: true } }
 * });
 */
export const currentUserWith = async <T extends Prisma.UsersInclude>(
    include: T
) => {
    const userId = currentUserId();
    const user = await prisma.users.findUnique({
        where: { id: userId },
        include,
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<typeof user, 'password'>;
};

/**
 * Lấy thông tin user với relations đầy đủ (roles, permissions, projects, members)
 */
export const currentUserWithRelations = async () => {
    return currentUserWith({
        usersRoles: {
            include: {
                role: true,
            },
        },
        usersPermissions: {
            include: {
                permission: true,
            },
        },
        projectsOwned: true,
        members: {
            include: {
                project: true,
            },
        },
    });
};

/**
 * Kiểm tra user hiện tại có phải admin không
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
    const user = await currentUserWith({
        usersRoles: { include: { role: true } }
    }) as UserWithRoles;
    return user.usersRoles?.some(ur => ur.role.name === UserRole.ADMIN) ?? false;
};

/**
 * Lấy user hiện tại kèm thông tin isAdmin
 */
export const currentUserWithRole = async () => {
    const user = await currentUserWith({
        usersRoles: { include: { role: true } }
    }) as UserWithRoles;
    const isAdmin = user.usersRoles?.some(ur => ur.role.name === UserRole.ADMIN) ?? false;
    return { user, isAdmin };
};
