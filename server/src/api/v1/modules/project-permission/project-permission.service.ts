import { AppError } from "../../../../core/errors/app-error";
import { buildWhereCondition } from "../../../../shared/pagination";
import { PermissionFacade } from "../../../../infrastructure/facades/permission.facade";

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

        const [permissions, total] = await Promise.all([
            PermissionFacade.findProjectPermissions(whereCondition, { [sortBy]: sortOrder }, skip, limit),
            PermissionFacade.countProjectPermissions(whereCondition),
        ]);

        return { permissions, total };
    }

    static async getProjectPermissionDetail(id: bigint) {
        const permission = await PermissionFacade.findProjectPermissionById(id);
        if (!permission) throw new AppError('Project permission not found', 404);
        return permission;
    }

    static async createProjectPermission(data: { key: string; name: string }) {
        const key = data.key.toLowerCase();

        const existing = await PermissionFacade.findProjectPermissionByKey(key);
        if (existing) throw new AppError('Project permission key already exists', 409);

        return PermissionFacade.createProjectPermission({ key, name: data.name });
    }

    static async updateProjectPermission(id: bigint, data: { key?: string; name?: string }) {
        const permission = await PermissionFacade.findProjectPermissionById(id);
        if (!permission) throw new AppError('Project permission not found', 404);

        const updateData: any = {};

        if (data.key) {
            const key = data.key.toLowerCase();
            const conflict = await PermissionFacade.findProjectPermissionByKeyExcluding(key, id);
            if (conflict) throw new AppError('Project permission key already exists', 409);
            updateData.key = key;
        }

        if (data.name) updateData.name = data.name;

        return PermissionFacade.updateProjectPermission(id, updateData);
    }

    static async deleteProjectPermission(id: bigint) {
        const permission = await PermissionFacade.findProjectPermissionById(id);
        if (!permission) throw new AppError('Project permission not found', 404);
        await PermissionFacade.deleteProjectPermission(id);
    }
}
