import { currentUser } from '../../../../hooks/useAuth';
import { AppError } from "../../../../core/errors/app-error";
import { createClientKeyInput } from "./api-key.schema";
import { generateClientKey } from "../../../../core/utils/generate-code";
import prisma from "../../../../infrastructure/libs/prisma";

export class ApiKeyService {
    static async createClientKey(data: createClientKeyInput) {
        const user = await currentUser();
        const code = generateClientKey();

        return prisma.appUsingAPI.create({
            data: { name: data.name, apiKey: code, userId: user.id, createdAt: new Date() },
            select: {
                id: true, name: true, apiKey: true, createdAt: true,
                user: { select: { id: true, email: true, phone: true, fullname: true, avatar: true } },
            },
        });
    }

    static async deleteClientKey(id: string) {
        const keyId = BigInt(id);
        const key = await prisma.appUsingAPI.findUnique({ where: { id: keyId } });
        if (!key) throw new AppError("Key not found", 404);

        const user = await currentUser();
        if (key.userId !== user.id) throw new AppError("You don't have permission to delete this key", 403);

        return prisma.appUsingAPI.delete({ where: { id: keyId } });
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
        const SEARCHABLE_FIELDS = ['name', 'apiKey'];

        const whereCondition: any = { userId: user.id };

        if (search) {
            if (searchField && SEARCHABLE_FIELDS.includes(searchField)) {
                whereCondition[searchField] = { contains: search, mode: 'insensitive' };
            } else {
                whereCondition.OR = SEARCHABLE_FIELDS.map(f => ({ [f]: { contains: search, mode: 'insensitive' } }));
            }
        }

        const [keys, total] = await Promise.all([
            prisma.appUsingAPI.findMany({
                where: whereCondition,
                select: { id: true, name: true, apiKey: true, createdAt: true },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.appUsingAPI.count({ where: whereCondition }),
        ]);

        return { keys, total };
    }
}
