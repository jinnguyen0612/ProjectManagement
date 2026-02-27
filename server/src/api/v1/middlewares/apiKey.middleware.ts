import { Request, Response, NextFunction } from "express";
import prisma from "../../../infrastructure/libs/prisma";

/**
 * Middleware kiểm tra API key từ header
 * Xác thực với bảng AppUsingAPI
 */
export const validateApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const apiKey = req.headers["x-api-key"] as string;

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "API key is missing",
            });
        }

        const app = await prisma.appUsingAPI.findFirst({
            where: {
                apiKey: apiKey,
            },
        });

        if (!app) {
            return res.status(403).json({
                success: false,
                message: "Invalid API key",
            });
        }

        req.apiClient = app;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error validating API key",
        });
    }
};

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            apiClient?: {
                id: bigint;
                name: string;
                apiKey: string;
                userId: bigint;
                createdAt: Date;
            };
        }
    }
}
