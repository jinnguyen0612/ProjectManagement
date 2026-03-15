import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { createPaginationResponse, parseQueryParamsWithFilters } from "../../../../shared/pagination";
import { ProjectPermissionService } from "./project-permission.service";
import {
    createProjectPermissionSchema,
    deleteProjectPermissionSchema,
    getProjectPermissionDetailSchema,
    getProjectPermissionsSchema,
    updateProjectPermissionSchema,
} from "./project-permission.schema";

export const getProjectPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParamsWithFilters(req.query);

    const { permissions, total } = await ProjectPermissionService.getProjectPermissions(
        skip, limit, search, sortBy, sortOrder
    );

    const result = createPaginationResponse(permissions, total, page, limit);
    return sendResponse(res, 200, {
        success: true,
        message: "Project permissions retrieved successfully",
        data: result.data,
        meta: result.pagination,
    });
});

export const getProjectPermissionDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getProjectPermissionDetailSchema.parse({ params: req.params });

    const permission = await ProjectPermissionService.getProjectPermissionDetail(params.id);
    return sendResponse(res, 200, {
        success: true,
        message: "Project permission retrieved successfully",
        data: permission,
    });
});

export const createProjectPermission = asyncHandler(async (req: Request, res: Response) => {
    const { body } = createProjectPermissionSchema.parse({ body: req.body });

    const permission = await ProjectPermissionService.createProjectPermission(body);
    return sendResponse(res, 201, {
        success: true,
        message: "Project permission created successfully",
        data: permission,
    });
});

export const updateProjectPermission = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateProjectPermissionSchema.parse({ params: req.params, body: req.body });

    const permission = await ProjectPermissionService.updateProjectPermission(params.id, body);
    return sendResponse(res, 200, {
        success: true,
        message: "Project permission updated successfully",
        data: permission,
    });
});

export const deleteProjectPermission = asyncHandler(async (req: Request, res: Response) => {
    const { params } = deleteProjectPermissionSchema.parse({ params: req.params });

    await ProjectPermissionService.deleteProjectPermission(params.id);
    return sendResponse(res, 200, {
        success: true,
        message: "Project permission deleted successfully",
        data: null,
    });
});
