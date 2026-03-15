import prisma from "../libs/prisma";
import { UserStatus, ProjectStatus } from "../../core/enums/status";
import { MemberRole } from "../../core/enums/role";

/** Shared select shape dùng lại ở nhiều chỗ */
export const PROJECT_DETAIL_SELECT = {
    id: true,
    code: true,
    name: true,
    status: true,
    bgColor: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    owner: {
        select: { id: true, fullname: true, email: true, phone: true },
    },
    members: {
        where: { user: { status: UserStatus.ACTIVE } },
        select: {
            id: true,
            role: true,
            user: { select: { id: true, avatar: true, fullname: true } },
        },
    },
    _count: { select: { statuses: true, members: true } },
} as const;

export class ProjectFacade {
    static findMany(where: any, select: any, orderBy: any, skip: number, take: number) {
        return prisma.projects.findMany({ where, select, orderBy, skip, take });
    }

    static count(where: any) {
        return prisma.projects.count({ where });
    }

    static findById(id: bigint) {
        return prisma.projects.findUnique({
            where: { id },
            select: PROJECT_DETAIL_SELECT,
        });
    }

    static findRaw(id: bigint) {
        return prisma.projects.findUnique({ where: { id } });
    }

    static async createWithDefaults(data: {
        code: string;
        name: string;
        description?: string | null;
        bgColor?: string | null;
        ownerId: bigint;
    }) {
        return prisma.$transaction(async (tx) => {
            const project = await tx.projects.create({
                data: {
                    code: data.code,
                    name: data.name,
                    description: data.description ?? null,
                    bgColor: data.bgColor ?? null,
                    status: 'active',
                    ownerId: data.ownerId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    members: {
                        create: {
                            userId: data.ownerId,
                            role: MemberRole.LEADER,
                            joinedAt: new Date(),
                        },
                    },
                },
                select: PROJECT_DETAIL_SELECT,
            });

            await tx.statuses.createMany({
                data: [
                    { name: 'To Do', bgColor: '#f59e0b', projectId: project.id },
                    { name: 'In Progress', bgColor: '#3b82f6', projectId: project.id },
                    { name: 'Done', bgColor: '#10b981', projectId: project.id },
                ],
            });

            return project;
        });
    }

    static update(id: bigint, data: any) {
        return prisma.projects.update({
            where: { id },
            data,
            select: {
                id: true, code: true, name: true, status: true,
                bgColor: true, ownerId: true, createdAt: true, updatedAt: true,
            },
        });
    }

    static archive(id: bigint) {
        return prisma.projects.update({
            where: { id },
            data: { status: ProjectStatus.ARCHIVED, updatedAt: new Date() },
            select: {
                id: true, code: true, name: true, status: true,
                bgColor: true, ownerId: true, updatedAt: true,
            },
        });
    }

    static upsertStar(userId: bigint, projectId: bigint) {
        return prisma.projectStars.upsert({
            where: { userId_projectId: { userId, projectId } },
            update: {},
            create: { userId, projectId, createdAt: new Date() },
        });
    }

    static deleteStar(userId: bigint, projectId: bigint) {
        return prisma.projectStars.deleteMany({ where: { userId, projectId } });
    }
}
