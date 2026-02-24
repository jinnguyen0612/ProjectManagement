import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate =
    (schema: ZodTypeAny) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const parsed = schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                }) as any;

                if (parsed.body) req.body = parsed.body;
                if (parsed.query) req.query = parsed.query;
                if (parsed.params) req.params = parsed.params;

                next();
            } catch (error: unknown) {
                if (error instanceof ZodError) {
                    const errors = error.issues.reduce((acc, curr) => {
                        const key = curr.path.join(".") || "body";
                        acc[key] = curr.message;
                        return acc;
                    }, {} as Record<string, string>);

                    return res.status(400).json({
                        success: false,
                        message: "Validation failed",
                        errors,
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                });
            }
        };