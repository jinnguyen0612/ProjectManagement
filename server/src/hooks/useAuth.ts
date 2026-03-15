import { getUserContext } from "./useUserContext";
import { AppError } from "../core/errors/app-error";
import { UserFacade } from "../infrastructure/facades/user.facade";
import { Prisma } from "@prisma/client";
import { UserRole } from "../core/enums/role";
import { UserWithRoles } from "../core/types/user-with-role";

export const currentUserId = (): number => {
    const context = getUserContext();
    if (!context || !context.userId) {
        throw new AppError("Unauthorized: User session not found", 401);
    }
    return context.userId;
};

export const currentUser = async () => {
    const userId = currentUserId();
    const user = await UserFacade.findById(userId);

    if (!user) throw new AppError("User not found", 404);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const currentUserWith = async <T extends Prisma.UsersInclude>(include: T) => {
    const userId = currentUserId();
    const user = await UserFacade.findByIdWith(userId, include);

    if (!user) throw new AppError("User not found", 404);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<typeof user, 'password'>;
};

export const currentUserWithRelations = async () => {
    return currentUserWith({
        usersRoles: { include: { role: true } },
        usersPermissions: { include: { permission: true } },
        projectsOwned: true,
        members: { include: { project: true } },
    });
};

export const isCurrentUserAdmin = async (): Promise<boolean> => {
    const user = await currentUserWith({
        usersRoles: { include: { role: true } },
    }) as UserWithRoles;
    return user.usersRoles?.some((ur) => ur.role.name === UserRole.ADMIN) ?? false;
};

export const currentUserWithRole = async () => {
    const user = await currentUserWith({
        usersRoles: { include: { role: true } },
    }) as UserWithRoles;
    const isAdmin = user.usersRoles?.some((ur) => ur.role.name === UserRole.ADMIN) ?? false;
    return { user, isAdmin };
};
