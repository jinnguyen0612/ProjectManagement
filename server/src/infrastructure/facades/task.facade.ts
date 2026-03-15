import prisma from "../libs/prisma";

const TASK_LIST_SELECT = {
    id: true,
    code: true,
    bgColor: true,
    position: true,
    dateStart: true,
    dateEnd: true,
    createdAt: true,
    status: { select: { id: true, name: true, bgColor: true } },
    tasksMembers: {
        select: {
            member: {
                select: {
                    id: true,
                    user: { select: { id: true, fullname: true, avatar: true } },
                },
            },
        },
    },
    tasksLabels: {
        select: { label: { select: { id: true, name: true, bgColor: true } } },
    },
    _count: { select: { tasksMembers: true } },
} as const;

const TASK_DETAIL_SELECT = {
    id: true,
    code: true,
    bgColor: true,
    position: true,
    dateStart: true,
    dateEnd: true,
    createdAt: true,
    updatedAt: true,
    status: { select: { id: true, name: true, bgColor: true } },
    creator: { select: { id: true, fullname: true, avatar: true } },
    tasksMembers: {
        select: {
            member: {
                select: {
                    id: true,
                    role: true,
                    user: { select: { id: true, fullname: true, avatar: true } },
                },
            },
        },
    },
    tasksLabels: {
        select: { label: { select: { id: true, name: true, bgColor: true } } },
    },
} as const;

export class TaskFacade {
    static findMany(where: any) {
        return prisma.tasks.findMany({
            where,
            select: TASK_LIST_SELECT,
            orderBy: [{ statusId: 'asc' }, { position: 'asc' }],
        });
    }

    static findOne(taskId: bigint, projectId: bigint) {
        return prisma.tasks.findFirst({
            where: { id: taskId, projectId },
            select: TASK_DETAIL_SELECT,
        });
    }

    static findRaw(taskId: bigint, projectId: bigint) {
        return prisma.tasks.findFirst({ where: { id: taskId, projectId } });
    }

    static findStatusInProject(statusId: bigint, projectId: bigint) {
        return prisma.statuses.findFirst({ where: { id: statusId, projectId } });
    }

    static findLastPosition(projectId: bigint, statusId: bigint) {
        return prisma.tasks.findFirst({
            where: { projectId, statusId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });
    }

    static create(data: {
        code: string;
        projectId: bigint;
        statusId: bigint;
        bgColor?: string | null;
        dateStart?: Date | null;
        dateEnd?: Date | null;
        position: bigint;
        createdBy: bigint;
    }) {
        return prisma.tasks.create({
            data: {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            select: {
                id: true, code: true, bgColor: true, position: true,
                dateStart: true, dateEnd: true, createdAt: true,
                status: { select: { id: true, name: true, bgColor: true } },
            },
        });
    }

    static update(taskId: bigint, data: any) {
        return prisma.tasks.update({
            where: { id: taskId },
            data,
            select: {
                id: true, code: true, bgColor: true, position: true,
                dateStart: true, dateEnd: true, updatedAt: true,
                status: { select: { id: true, name: true, bgColor: true } },
            },
        });
    }

    static delete(taskId: bigint) {
        return prisma.tasks.delete({ where: { id: taskId } });
    }

    static validateMembersInProject(memberIds: bigint[], projectId: bigint) {
        return prisma.members.findMany({
            where: { id: { in: memberIds }, projectId },
            select: { id: true },
        });
    }

    static replaceAssignees(taskId: bigint, memberIds: bigint[]) {
        return prisma.$transaction([
            prisma.tasksMembers.deleteMany({ where: { taskId } }),
            prisma.tasksMembers.createMany({
                data: memberIds.map((memberId) => ({ taskId, memberId })),
            }),
        ]);
    }

    static findWithAssignees(taskId: bigint) {
        return prisma.tasks.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                code: true,
                tasksMembers: {
                    select: {
                        member: {
                            select: {
                                id: true,
                                user: { select: { id: true, fullname: true, avatar: true } },
                            },
                        },
                    },
                },
            },
        });
    }
}
