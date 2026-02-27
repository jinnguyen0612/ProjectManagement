import { currentUser } from './../../../../hooks/useAuth';
import prisma from "../../../../infrastructure/libs/prisma";
import { AppError } from "../../../../core/errors/AppError";
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
                createdAt: new Date,
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
}