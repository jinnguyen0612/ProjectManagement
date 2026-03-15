import { currentUser } from './../../../../hooks/useAuth';
import prisma from "../../../../infrastructure/libs/prisma";
import { AppError } from "../../../../core/errors/app-error";
import { createClientKeyInput } from "./api-key.schema";
import { generateClientKey } from "../../../../core/utils/generate-code";

export class ApiKeyService {
    static async createClientKey(data: createClientKeyInput) {
        const user = await currentUser();
        const code = generateClientKey();
        const clientKey = await prisma.appUsingAPI.create({
            data: {
                name: data.name,
                apiKey: code,
                userId: user.id,
                createdAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                apiKey: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        fullname: true,
                        avatar: true,
                    }
                }
            }
        })

        return clientKey;
    }

    static async deleteClientKey(id: string) {
        const keyId = BigInt(id);
        
        const key = await prisma.appUsingAPI.findUnique({
            where: {
                id: keyId,
            }
        });

        if (!key) throw new AppError("Key not found", 404);

        // Kiểm tra quyền sở hữu
        const user = await currentUser();
        if (key.userId !== user.id) {
            throw new AppError("You don't have permission to delete this key", 403);
        }

        const deleteKey = await prisma.appUsingAPI.delete({
            where: {
                id: keyId,
            }
        });

        return deleteKey;
    }

    static async listClientKeys(
        page: number,
        limit: number,
        skip: number,
        search?: string,
        searchField?: string,
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        const user = await currentUser();

        // Whitelist các fields được phép search
        const SEARCHABLE_FIELDS = ['name', 'apiKey'];
        
        // Build where condition
        const whereCondition: any = {
            userId: user.id,
        };

        // Thêm search nếu có
        if (search) {
            if (searchField && SEARCHABLE_FIELDS.includes(searchField)) {
                // Search theo field cụ thể
                whereCondition[searchField] = {
                    contains: search,
                    mode: 'insensitive',
                };
            } else {
                // Search tất cả fields được phép (mặc định)
                whereCondition.OR = SEARCHABLE_FIELDS.map(field => ({
                    [field]: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }));
            }
        }

        // Build orderBy
        const orderBy: any = {
            [sortBy]: sortOrder,
        };

        const [keys, total] = await Promise.all([
            prisma.appUsingAPI.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    name: true,
                    apiKey: true,
                    createdAt: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.appUsingAPI.count({
                where: whereCondition,
            }),
        ]);

        return { keys, total };
    }
}
