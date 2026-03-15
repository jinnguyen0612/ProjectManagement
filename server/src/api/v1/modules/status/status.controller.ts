import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { StatusService } from "./status.service";
import {
    createStatusSchema,
    deleteStatusSchema,
    getStatusesSchema,
    reorderStatusesSchema,
    updateStatusSchema,
} from "./status.schema";

export const getStatuses = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getStatusesSchema.parse({ params: req.params });
    const statuses = await StatusService.getStatuses(params.id);
    return sendResponse(res, 200, { success: true, message: "Statuses retrieved successfully", data: statuses });
});

export const createStatus = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = createStatusSchema.parse({ params: req.params, body: req.body });
    const status = await StatusService.createStatus(params.id, body);
    return sendResponse(res, 201, { success: true, message: "Status created successfully", data: status });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateStatusSchema.parse({ params: req.params, body: req.body });
    const status = await StatusService.updateStatus(params.id, params.statusId, body);
    return sendResponse(res, 200, { success: true, message: "Status updated successfully", data: status });
});

export const deleteStatus = asyncHandler(async (req: Request, res: Response) => {
    const { params } = deleteStatusSchema.parse({ params: req.params });
    await StatusService.deleteStatus(params.id, params.statusId);
    return sendResponse(res, 200, { success: true, message: "Status deleted successfully", data: null });
});

export const reorderStatuses = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = reorderStatusesSchema.parse({ params: req.params, body: req.body });
    const statuses = await StatusService.reorderStatuses(params.id, body.orderedIds);
    return sendResponse(res, 200, { success: true, message: "Statuses reordered successfully", data: statuses });
});
