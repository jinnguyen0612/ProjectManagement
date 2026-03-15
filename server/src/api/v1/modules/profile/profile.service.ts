import { AppError } from "../../../../core/errors/app-error";
import { comparePassword, hashPassword } from "../../../../infrastructure/libs/bcrypt";
import { UserFacade } from "../../../../infrastructure/facades/user.facade";

export class ProfileService {
    static async updateProfile(id: bigint, data: any) {
        const user = await UserFacade.update(id, data);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async changePassword(id: bigint, data: any) {
        const user = await UserFacade.findById(id);
        if (!user) throw new AppError("User not found", 404);

        const isPasswordValid = await comparePassword(data.oldPassword, user.password);
        if (!isPasswordValid) throw new AppError("Invalid old password", 401);

        const hashedPassword = await hashPassword(data.newPassword);
        await UserFacade.update(id, { password: hashedPassword });
    }
}
