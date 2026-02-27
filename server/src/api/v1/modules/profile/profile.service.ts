import prisma from "../../../../infrastructure/libs/prisma";
import { AppError } from "../../../../core/errors/AppError";
import { comparePassword, hashPassword } from "../../../../infrastructure/libs/bcrypt";

export class ProfileService {
    static async updateProfile(id: bigint, data: any) {
        const user = await prisma.users.update({
            where: { id },
            data,
        });

        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    static async changePassword(id: bigint, data:any){
        const user = await prisma.users.findUnique({
            where: { id },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const isPasswordValid = await comparePassword(data.oldPassword, user.password);

        if (!isPasswordValid) {
            throw new AppError("Invalid old password", 401);
        }

        const hashedPassword = await hashPassword(data.newPassword);

        await prisma.users.update({
            where: { id },
            data: {
                password: hashedPassword,
            },
        });

        return;
    }
}