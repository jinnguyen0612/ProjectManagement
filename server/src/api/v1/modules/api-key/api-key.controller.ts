import { Request, Response } from "express";

import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { ApiKeyService } from "./api-key.service";
import { parseQueryParams, createPaginationResponse } from "../../../../shared/pagination";

export const createClientKey = asyncHandler(async (req: Request, res: Response) => {
    const clientKey = await ApiKeyService.createClientKey(req.body);
    return sendResponse(res, 201, {
        success: true,
        message: "Client key created successfully",
        data: clientKey,
    });
});

export const deleteClientKey = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await ApiKeyService.deleteClientKey(id);
    return sendResponse(res, 200, {
        success: true,
        message: "Client key deleted successfully",
    });
});

export const listClientKeys = asyncHandler(async (req: Request, res: Response) => {
    const { parseQueryParams, createPaginationResponse } = 
        await import("../../../../shared/pagination.js");
    
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParams(req.query);
    const searchField = req.query.searchField as string | undefined;
    
    const { keys, total } = await ApiKeyService.listClientKeys(
        page,
        limit,
        skip,
        search,
        searchField,
        sortBy || 'createdAt',
        sortOrder
    );
    
    const result = createPaginationResponse(keys, total, page, limit);
    
    return sendResponse(res, 200, {
        success: true,
        message: "Client keys retrieved successfully",
        data: result.data,
        meta: result.pagination,
    });
});
