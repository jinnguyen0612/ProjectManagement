import prisma from "../libs/prisma";

const STATUS_SELECT = {
    id: true,
    name: true,
    bgColor: true,
    position: true,
} as const;

export class StatusFacade {
    static findAll(projectId: bigint) {
        return prisma.statuses.findMany({
            where: { projectId },
            select: STATUS_SELECT,
            orderBy: { position: 'asc' },
        });
    }

    static findOne(statusId: bigint, projectId: bigint) {
        return prisma.statuses.findFirst({ where: { id: statusId, projectId } });
    }

    static findByName(projectId: bigint, name: string, excludeId?: bigint) {
        return prisma.statuses.findFirst({
            where: {
                projectId,
                name,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });
    }

    static findLastPosition(projectId: bigint) {
        return prisma.statuses.findFirst({
            where: { projectId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });
    }

    static create(data: { projectId: bigint; name: string; bgColor?: string | null; position: number }) {
        return prisma.statuses.create({
            data,
            select: STATUS_SELECT,
        });
    }

    static update(statusId: bigint, data: { name?: string; bgColor?: string }) {
        return prisma.statuses.update({
            where: { id: statusId },
            data,
            select: STATUS_SELECT,
        });
    }

    static delete(statusId: bigint) {
        return prisma.statuses.delete({ where: { id: statusId } });
    }

    static countTasks(statusId: bigint) {
        return prisma.tasks.count({ where: { statusId } });
    }

    static findAllIds(projectId: bigint) {
        return prisma.statuses.findMany({
            where: { projectId },
            select: { id: true },
        });
    }

    static reorder(orderedIds: bigint[]) {
        return prisma.$transaction(
            orderedIds.map((id, index) =>
                prisma.statuses.update({ where: { id }, data: { position: index } })
            )
        );
    }
}
