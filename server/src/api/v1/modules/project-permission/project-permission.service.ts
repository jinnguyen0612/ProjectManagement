import prisma from "../../../../infrastructure/libs/prisma";
import { AppError } from "../../../../core/errors/app-error";
import { buildWhereCondition } from "../../../../shared/pagination";

export class ProjectPermissionService {
    static async getProjectPermissions(
        skip: number,
        limit: number,
        search?: string,
        sortBy: string = 'id',
        sortOrder: 'asc' | 'desc' = 'asc'
    ) {
        let whereCondition: any = {};

        if (search) {
            whereCondition.OR = [
                { key: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const orderBy = { [sortBy]: sortOrder };

        const [permissions, total] = await Promise.all([
            prisma.projectPermissions.findMany({
                where: whereCondition,
                select: { id: true, key: true, name: true },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.projectPermissions.count({ where: whereCondition }),
        ]);

        return { permissions, total };
    }

    static async getProjectPermissionDetail(id: bigint) {
        const permission = await prisma.projectPermissions.findUnique({
            where: { id },
            select: {
                id: true,
                key: true,
                name: true,
                memberRolesPermissions: {
                    select: { role: true }
                }
            }
        });

        if (!permission) throw new AppError('Project permission not found', 404);
        return permission;
    }

    static async createProjectPermission(data: { key: string; name: string }) {
        const key = data.key.toLowerCase();

        const existing = await prisma.projectPermissions.findUnique({ where: { key } });
        if (existing) throw new AppError('Project permission key already exists', 409);

        return prisma.projectPermissions.create({
            data: { key, name: data.name },
            select: { id: true, key: true, name: true }
        });
    }

    static async updateProjectPermission(id: bigint, data: { key?: string; name?: string }) {
        const permission = await prisma.projectPermissions.findUnique({ where: { id } });
        if (!permission) throw new AppError('Project permission not found', 404);

        const updateData: any = {};

        if (data.key) {
            const key = data.key.toLowerCase();
            const conflict = await prisma.projectPermissions.findFirst({
                where: { key, id: { not: id } }
            });
            if (conflict) throw new AppError('Project permission key already exists', 409);
            updateData.key = key;
        }

        if (data.name) updateData.name = data.name;

        return prisma.projectPermissions.update({
            where: { id },
            data: updateData,
            select: { id: true, key: true, name: true }
        });
    }

    static async deleteProjectPermission(id: bigint) {
        const permission = await prisma.projectPermissions.findUnique({ where: { id } });
        if (!permission) throw new AppError('Project permission not found', 404);

        await prisma.projectPermissions.delete({ where: { id } });
    }
}
