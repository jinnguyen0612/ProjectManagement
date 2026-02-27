import { Request, Response } from "express";

import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { ApiKeyService } from "./api-key.service";

export const createClientKey = asyncHandler(async (req: Request, res: Response) => {
    const clientKey = await ApiKeyService.createClientKey(req.body);
    return sendResponse(res, 200, {
        success: true,
        message: "",
        data: clientKey,
    });
})