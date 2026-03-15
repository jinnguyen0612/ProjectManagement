import { Prisma } from "@prisma/client";

export type UserWithRoles = Prisma.UsersGetPayload<{
    include: {
        usersRoles: {
            include: { role: true }
        }
    }
}>;