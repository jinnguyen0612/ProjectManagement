import { getUserContext } from "./useUserContext";
import { AppError } from "../core/errors/AppError";
import prisma from "../infrastructure/libs/prisma";

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
