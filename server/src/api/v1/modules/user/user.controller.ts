import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { parseQueryParamsWithFilters, createPaginationResponse } from "../../../../shared/pagination";
import { UserService } from "./user.service";
import { blockUserSchema, getUserDetailSchema, updateUserPermissionSchema, updateUserSchema } from "./user.schema";

/**
 * GET /api/v1/users
 * Get list of users with pagination, search, and filters
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    // Định nghĩa allowed filters (bao gồm cả operators)
    const ALLOWED_FILTERS = [
        'status',
        'status_in',
    ];

    const { page, limit, skip, search, searchField, sortBy, sortOrder, filters } =
        parseQueryParamsWithFilters(req.query, ALLOWED_FILTERS);

    const { users, total } = await UserService.getUsers(
        skip,
        limit,
        search,
        searchField,
        filters,
        sortBy || 'createdAt',
        sortOrder
    );

    const result = createPaginationResponse(users, total, page, limit);

    return sendResponse(res, 200, {
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.pagination,
    });
});

export const getUserDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getUserDetailSchema.parse({ params: req.params });
    const id = params.id;

    const user = await UserService.getUserDetail(id);
    return sendResponse(res, 200, {
        success: true,
        message: "User retrieved successfully",
        data: user,
    });
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await  UserService.createUser(req.body);
    return sendResponse(res, 201, {
        success: true,
        message: "User created successfully",
        data: user,
    });
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateUserSchema.parse({ 
        params: req.params,
        body: req.body
    });
    const id = params.id;
    const user = await UserService.updateUser(id, body);
    
    return sendResponse(res, 200, {
        success: true,
        message: "User updated successfully",
        data: user,
    });
})

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
    const { params } = blockUserSchema.parse({params: req.params});
    const id = params.id;
    await UserService.blockUser(id);
    return sendResponse(res, 200, {
        success: true,
        message: "User blocked successfully",
    });
})

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
    const { params } = blockUserSchema.parse({params: req.params});
    const id = params.id;
    await UserService.unblockUser(id);
    return sendResponse(res, 200, {
        success: true,
        message: "User unblocked successfully",
    });
})

export const updateUserPermission = asyncHandler(async (req: Request, res: Response) => {
    const { params } = updateUserPermissionSchema.parse({ params: req.params })
    const id = params.id;
    await UserService.updateUserPermission(id, req.body);
    return sendResponse(res, 200, {
        success: true,
        message: "User permission updated successfully",
    });
})