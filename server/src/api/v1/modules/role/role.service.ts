import prisma from "../../../../infrastructure/libs/prisma";
import { buildWhereCondition } from "../../../../shared/pagination";
import { AppError } from "../../../../core/errors/app-error";

export class RoleService {
    static async getRoles(
        skip: number,
        limit: number,
        search?: string,
        searchField?: string,
        filters: Record<string, any> = {},
        sortBy: string = 'id',
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const SEARCHABLE_FIELDS = ['name'];

        let whereCondition: any = {};

        // Add search
        if (search) {
            if (searchField && SEARCHABLE_FIELDS.includes(searchField)) {
                // Search specific field
                whereCondition[searchField] = {
                    contains: search,
                    mode: 'insensitive',
                };
            } else {
                // Search all fields
                whereCondition.OR = SEARCHABLE_FIELDS.map(field => ({
                    [field]: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }));
            }
        }

        // Add filters (operators tự động xử lý)
        whereCondition = buildWhereCondition(whereCondition, filters, {
            status: 'exact',
        });

        // Build orderBy
        const orderBy: any = {
            [sortBy]: sortOrder,
        };

        const [roles, total] = await Promise.all([
            prisma.roles.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    name: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.roles.count({
                where: whereCondition,
            }),
        ]);

        return { roles, total };
    }

    static async getRoleDetail(id: bigint) {
        const role = await prisma.roles.findFirst({
            where: { id },
            include: {
                rolesPermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        
        if (!role) {
            throw new AppError('Role not found', 404);
        }
        
        return role;
    }

    static async createRole(data: any) {
        const isExist = await prisma.roles.findUnique({
            where: {
                name: data.name
            }
        });
        
        if (isExist) {
            throw new AppError('Role already exists', 409);
        }

        const role = await prisma.$transaction(async (tx) => {
            const newRole = await tx.roles.create({
                data: {
                    name: data.name,
                }
            });

            if (data.permissionIds && data.permissionIds.length > 0) {
                await tx.rolesPermissions.createMany({
                    data: data.permissionIds.map((permissionId: bigint) => ({
                        roleId: newRole.id,
                        permissionId: permissionId
                    }))
                });
            }
                
            return await tx.roles.findFirst({
                where: {
                    id: newRole.id
                },
                include: {
                    rolesPermissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            });
        });
        
        return role;
    }

    static async updateRole(id: bigint, data: any) {
        const isExist = await prisma.roles.findUnique({
            where: { id }
        });
        
        if (!isExist) {
            throw new AppError('Role not found', 404);
        }

        return await prisma.$transaction(async (tx) => {
            // Update name nếu có
            if (data.name) {
                await tx.roles.update({
                    where: { id },
                    data: { name: data.name }
                });
            }

            // Update permissions nếu có
            if (data.permissionIds) {
                // Remove all old permissions
                await tx.rolesPermissions.deleteMany({
                    where: { roleId: id }
                });

                // Add new permissions
                if (data.permissionIds.length > 0) {
                    await tx.rolesPermissions.createMany({
                        data: data.permissionIds.map((permissionId: bigint) => ({
                            roleId: id,
                            permissionId: permissionId
                        }))
                    });
                }
            }

            return await tx.roles.findFirst({
                where: { id },
                include: {
                    rolesPermissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            });
        });
    }
}