import prisma from "../../../../infrastructure/libs/prisma";
import { buildWhereCondition } from "../../../../shared/pagination";
import { AppError } from "../../../../core/errors/app-error";

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
        // Whitelist searchable fields
        const SEARCHABLE_FIELDS = ['name', 'key'];

        // Base condition
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

        const [permissions, total] = await Promise.all([
            prisma.permissions.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    name: true,
                    key: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.permissions.count({
                where: whereCondition,
            }),
        ]);

        return { permissions, total };
    }

    static async getPermissionDetail(id: bigint) {
        const permission = prisma.permissions.findFirst({
            where: { id }
        });
        if(!permission){
            throw new AppError('Permission not found', 404);
        }
        return permission;
    }

    static async createPermission(data: any){
        const key = data.key.toLowerCase();
        
        const isExist = await prisma.permissions.findUnique({
            where: { key }
        });
        
        if(isExist) {
            throw new AppError('Permission already exists', 409);
        }

        return prisma.permissions.create({
            data: {
                key,
                name: data.name
            }
        });
    }

    static async updatePermission(id: bigint, data: any){
        const updateData: any = {};

        const permission = await prisma.permissions.findUnique({
            where: { id }
        });
        
        if(!permission) {
            throw new AppError('Permission not found', 404);
        }
        
        if(data.key){
            const key = data.key.toLowerCase();
            
            const isExist = await prisma.permissions.findFirst({
                where: {
                    key: key,
                    id: { not: id }
                }
            });
            
            if(isExist) {
                throw new AppError('Permission key already exists', 409);
            }
            
            updateData.key = key;
        }
        
        if(data.name){
            updateData.name = data.name;
        }

        return prisma.permissions.update({
            where: { id },
            data: updateData
        });
    }
}