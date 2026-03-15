import { Request, Response, NextFunction } from "express";
import { logError } from "../../shared/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;

    // Chỉ log 5xx errors — 4xx là lỗi có chủ đích, không cần log
    if (statusCode >= 500) {
        logError(err.stack || err.message, req);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};
