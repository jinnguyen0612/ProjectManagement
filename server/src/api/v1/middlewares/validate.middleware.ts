import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate =
    (schema: ZodTypeAny) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

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