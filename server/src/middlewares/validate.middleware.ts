import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
    (schema: ZodType) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                next();
            } catch (error: any) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors.reduce((acc: any, curr: any) => {
                        acc[curr.path.join(".")] = curr.message;
                        return acc;
                    }, {}),
                });
            }
        };