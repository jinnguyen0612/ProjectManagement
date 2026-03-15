import prisma from "../libs/prisma";
import { MemberRole } from "../../core/enums/role";

export const MEMBER_DETAIL_SELECT = {
    id: true,
    role: true,
    joinedAt: true,
    user: {
        select: {
            id: true,
            fullname: true,
            avatar: true,
            email: true,
            phone: true,
            status: true,
        },
    },
    membersPermissions: {
        select: {
            isDeny: true,
            projectPermission: { select: { id: true, key: true, name: true } },
        },
    },
} as const;

export class MemberFacade {
    static findInProject(projectId: bigint, memberId: bigint) {
        return prisma.members.findFirst({
            where: { id: memberId, projectId },
            select: MEMBER_DETAIL_SELECT,
        });
    }

    static findByUserId(projectId: bigint, userId: bigint) {
        return prisma.members.findFirst({ where: { projectId, userId } });
    }

    static findByUserIdWithPermissions(projectId: bigint, userId: bigint) {
        return prisma.members.findFirst({
            where: { projectId, userId },
            include: {
                membersPermissions: { include: { projectPermission: true } },
            },
        });
    }

    static create(data: {
        projectId: bigint;
        userId: bigint;
        role: MemberRole;
        addBy: bigint;
    }) {
        return prisma.members.create({
            data: {
                projectId: data.projectId,
                userId: data.userId,
                role: data.role,
                addBy: data.addBy,
                joinedAt: new Date(),
            },
            select: {
                id: true,
                role: true,
                joinedAt: true,
                user: { select: { id: true, fullname: true, avatar: true, email: true } },
            },
        });
    }

    static delete(memberId: bigint) {
        return prisma.members.delete({ where: { id: memberId } });
    }

    static updateRole(memberId: bigint, role: MemberRole) {
        return prisma.members.update({
            where: { id: memberId },
            data: { role },
            select: {
                id: true,
                role: true,
                user: { select: { id: true, fullname: true, avatar: true } },
            },
        });
    }

    static upsertPermissions(
        memberId: bigint,
        permissions: { projectPermissionId: bigint; isDeny: boolean }[]
    ) {
        return prisma.$transaction(
            permissions.map((p) =>
                prisma.membersPermissions.upsert({
                    where: {
                        memberId_projectPermissionId: {
                            memberId,
                            projectPermissionId: p.projectPermissionId,
                        },
                    },
                    update: { isDeny: p.isDeny },
                    create: {
                        memberId,
                        projectPermissionId: p.projectPermissionId,
                        isDeny: p.isDeny,
                    },
                })
            )
        );
    }

    static validatePermissionIds(ids: bigint[]) {
        return prisma.projectPermissions.findMany({
            where: { id: { in: ids } },
            select: { id: true },
        });
    }
}
