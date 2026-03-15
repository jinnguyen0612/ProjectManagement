import { Request, Response } from "express";
import { sendError, sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { PermissionService } from "./permission.service";
import { createPaginationResponse, parseQueryParamsWithFilters } from "../../../../shared/pagination";
import { getPermissionDetailSchema, updatePermissionSchema } from "./permission.schema";

export const getPermissions = asyncHandler(async (req: Request, res: Response) => {

    const { page, limit, skip, search, searchField, sortBy, sortOrder, filters } =
        parseQueryParamsWithFilters(req.query);

    const { permissions, total } = await PermissionService.getPermissions(skip, limit, search, searchField, filters, sortBy, sortOrder);

    const result = createPaginationResponse(permissions, total, page, limit);

    return sendResponse(res, 200, {
        success: true,
        message: "Permissions retrieved successfully",
        data: result.data,
        meta: result.pagination
    })
})

export const getPermissionDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getPermissionDetailSchema.parse({ params: req.params });
    const id = params.id;

    const permission = await PermissionService.getPermissionDetail(id);
    return sendResponse(res, 200, {
        success: true,
        message: "Permission retrieved successfully",
        data: permission,
    });
})

export const createPermission = asyncHandler(async (req: Request, res: Response) => {
    const permission = await PermissionService.createPermission(req.body);

    return sendResponse(res, 201, {
        success: true,
        message: "Permission created successfully",
        data: permission,
    });
})

export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updatePermissionSchema.parse({
        params: req.params,
        body: req.body
    });
    const id = params.id;
    const permission = await PermissionService.updatePermission(id, body);

    return sendResponse(res, 200, {
        success: true,
        message: "Permission updated successfully",
        data: permission,
    });
})