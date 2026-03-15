import { Request, Response } from "express";
import { sendError, sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { createPaginationResponse, parseQueryParamsWithFilters } from "../../../../shared/pagination";
import { RoleService } from "./role.service";
import { getRoleDetailSchema, updateRoleSchema } from "./role.schema";

export const getRoles = asyncHandler(async (req: Request, res: Response) => {

    const { page, limit, skip, search, searchField, sortBy, sortOrder, filters } =
        parseQueryParamsWithFilters(req.query);

    const { roles, total } = await RoleService.getRoles(skip, limit, search, searchField, filters, sortBy, sortOrder);

    const result = createPaginationResponse(roles, total, page, limit);

    return sendResponse(res, 200, {
        success: true,
        message: "Roles retrieved successfully",
        data: result.data,
        meta: result.pagination
    })
})

export const getRoleDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getRoleDetailSchema.parse({ params: req.params });
    const id = params.id;

    const role = await RoleService.getRoleDetail(id);
    return sendResponse(res, 200, {
        success: true,
        message: "Role retrieved successfully",
        data: role,
    });
})

export const createRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await RoleService.createRole(req.body);

    return sendResponse(res, 201, {
        success: true,
        message: "Role created successfully",
        data: role,
    });
})

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateRoleSchema.parse({
        params: req.params,
        body: req.body
    });
    const id = params.id;
    const role = await RoleService.updateRole(id, body);

    return sendResponse(res, 200, {
        success: true,
        message: "Role updated successfully",
        data: role,
    });
})