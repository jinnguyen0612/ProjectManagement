import { buildWhereCondition } from "../../../../shared/pagination";
import { AppError } from "../../../../core/errors/app-error";
import { PermissionFacade } from "../../../../infrastructure/facades/permission.facade";

export class PermissionService {
    static async getPermissions(
        skip: number,
        limit: number,
        search?: string,
        searchField?: string,
        filters: Record<string, any> = {},
        sortBy: string = 'id',
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const SEARCHABLE_FIELDS = ['name', 'key'];
        let whereCondition: any = {};

        if (search) {
            whereCondition = searchField && SEARCHABLE_FIELDS.includes(searchField)
                ? { [searchField]: { contains: search, mode: 'insensitive' } }
                : { OR: SEARCHABLE_FIELDS.map(f => ({ [f]: { contains: search, mode: 'insensitive' } })) };
        }

        whereCondition = buildWhereCondition(whereCondition, filters, { status: 'exact' });

        const [permissions, total] = await Promise.all([
            PermissionFacade.findPermissions(
                whereCondition,
                { id: true, name: true, key: true },
                { [sortBy]: sortOrder },
                skip,
                limit
            ),
            PermissionFacade.countPermissions(whereCondition),
        ]);

        return { permissions, total };
    }

    static async getPermissionDetail(id: bigint) {
        const permission = await PermissionFacade.findPermissionById(id);
        if (!permission) throw new AppError('Permission not found', 404);
        return permission;
    }

    static async createPermission(data: any) {
        const key = data.key.toLowerCase();

        const isExist = await PermissionFacade.findPermissionByKey(key);
        if (isExist) throw new AppError('Permission already exists', 409);

        return PermissionFacade.createPermission({ key, name: data.name });
    }

    static async updatePermission(id: bigint, data: any) {
        const permission = await PermissionFacade.findPermissionById(id);
        if (!permission) throw new AppError('Permission not found', 404);

        const updateData: any = {};

        if (data.key) {
            const key = data.key.toLowerCase();
            const isExist = await PermissionFacade.findPermissionByKeyExcluding(key, id);
            if (isExist) throw new AppError('Permission key already exists', 409);
            updateData.key = key;
        }

        if (data.name) updateData.name = data.name;

        return PermissionFacade.updatePermission(id, updateData);
    }
}
