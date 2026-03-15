import prisma from "../../../../infrastructure/libs/prisma";
import { AppError } from "../../../../core/errors/app-error";
import { assertProjectPermission, assertProjectOwnerOrLeader } from "../../../../hooks/useProject";
import { MemberRole } from "../../../../core/enums/role";
import { UserStatus } from "../../../../core/enums/status";
import { currentUserWithRole } from "../../../../hooks/useAuth";

export class MemberService {
    static async getMemberDetail(projectId: bigint, memberId: bigint) {
        const member = await prisma.members.findFirst({
            where: { id: memberId, projectId },
            select: {
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
                    }
                },
                membersPermissions: {
                    select: {
                        isDeny: true,
                        projectPermission: {
                            select: { id: true, key: true, name: true }
                        }
                    }
                }
            }
        });

        if (!member) throw new AppError('Member not found in this project', 404);

        return member;
    }

    static async addMember(projectId: bigint, data: any) {
        const project = await prisma.projects.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectPermission(projectId, 'project.member.create');

        const user = await prisma.users.findUnique({ where: { id: data.userId } });
        if (!user) throw new AppError('User not found', 404);

        const existing = await prisma.members.findFirst({
            where: { projectId, userId: data.userId }
        });
        if (existing) throw new AppError('User is already a member of this project', 409);

        const { user: currentUser } = await currentUserWithRole();

        return prisma.members.create({
            data: {
                projectId,
                userId: data.userId,
                role: data.role ?? MemberRole.MEMBER,
                addBy: currentUser.id,
                joinedAt: new Date(),
            },
            select: {
                id: true,
                role: true,
                joinedAt: true,
                user: {
                    select: { id: true, fullname: true, avatar: true, email: true }
                }
            }
        });
    }

    static async removeMember(projectId: bigint, memberId: bigint) {
        const project = await prisma.projects.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectPermission(projectId, 'project.member.delete');

        const member = await prisma.members.findFirst({
            where: { id: memberId, projectId }
        });
        if (!member) throw new AppError('Member not found in this project', 404);

        if (member.userId === project.ownerId) {
            throw new AppError('Cannot remove the project owner', 403);
        }

        await prisma.members.delete({ where: { id: memberId } });
    }

    static async changeMemberRole(projectId: bigint, memberId: bigint, role: MemberRole) {
        const project = await prisma.projects.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectPermission(projectId, 'project.member.update');

        const member = await prisma.members.findFirst({
            where: { id: memberId, projectId }
        });
        if (!member) throw new AppError('Member not found in this project', 404);

        if (member.userId === project.ownerId) {
            throw new AppError('Cannot change role of the project owner', 403);
        }

        return prisma.members.update({
            where: { id: memberId },
            data: { role },
            select: {
                id: true,
                role: true,
                user: { select: { id: true, fullname: true, avatar: true } }
            }
        });
    }

    static async updateMemberPermissions(
        projectId: bigint,
        memberId: bigint,
        permissions: { projectPermissionId: bigint; isDeny: boolean }[]
    ) {
        const project = await prisma.projects.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError('Project not found', 404);

        await assertProjectOwnerOrLeader(projectId);

        const member = await prisma.members.findFirst({
            where: { id: memberId, projectId }
        });
        if (!member) throw new AppError('Member not found in this project', 404);

        const permIds = permissions.map(p => p.projectPermissionId);
        const existing = await prisma.projectPermissions.findMany({
            where: { id: { in: permIds } },
            select: { id: true }
        });
        if (existing.length !== permIds.length) {
            throw new AppError('One or more project permissions not found', 404);
        }

        await prisma.$transaction(
            permissions.map(p =>
                prisma.membersPermissions.upsert({
                    where: {
                        memberId_projectPermissionId: {
                            memberId,
                            projectPermissionId: p.projectPermissionId,
                        }
                    },
                    update: { isDeny: p.isDeny },
                    create: { memberId, projectPermissionId: p.projectPermissionId, isDeny: p.isDeny },
                })
            )
        );

        return MemberService.getMemberDetail(projectId, memberId);
    }
}
