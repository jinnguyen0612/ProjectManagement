import prisma from "../libs/prisma";
import { Prisma } from "@prisma/client";

export class UserFacade {
    static findById(id: bigint | number) {
        return prisma.users.findUnique({ where: { id: BigInt(id) } });
    }

    static findByIdWith<T extends Prisma.UsersInclude>(id: bigint | number, include: T) {
        return prisma.users.findUnique({ where: { id: BigInt(id) }, include });
    }

    static findByEmail(email: string) {
        return prisma.users.findUnique({ where: { email } });
    }

    static findByPhone(phone: string) {
        return prisma.users.findUnique({ where: { phone } });
    }

    static findByCredentials(username: string, status: string) {
        return prisma.users.findFirst({
            where: {
                OR: [{ email: username }, { phone: username }],
                status: status as any,
            },
        });
    }

    static update(id: bigint, data: any) {
        return prisma.users.update({ where: { id }, data });
    }

    static activate(email: string) {
        return prisma.users.update({
            where: { email },
            data: { status: 'active' as any },
        });
    }

    static getRolesAndPermissions(userId: bigint) {
        return Promise.all([
            prisma.usersRoles.findMany({
                where: { userId },
                include: {
                    role: {
                        include: {
                            rolesPermissions: { include: { permission: true } },
                        },
                    },
                },
            }),
            prisma.usersPermissions.findMany({
                where: { userId },
                include: { permission: true },
            }),
        ]);
    }

    static findRole(name: string) {
        return prisma.roles.findUnique({ where: { name } });
    }

    static createWithRole(userData: any, roleId: bigint) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.users.create({ data: userData });
            await tx.usersRoles.create({ data: { userId: user.id, roleId } });
            return user;
        });
    }
}
