import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { TaskService } from "./task.service";
import {
    assignMembersSchema,
    createTaskSchema,
    deleteTaskSchema,
    getTaskDetailSchema,
    getTasksSchema,
    updateTaskSchema,
} from "./task.schema";

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
    const { params, query } = getTasksSchema.parse({ params: req.params, query: req.query });
    const tasks = await TaskService.getTasks(params.id, query as any);
    return sendResponse(res, 200, { success: true, message: "Tasks retrieved successfully", data: tasks });
});

export const getTaskDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getTaskDetailSchema.parse({ params: req.params });
    const task = await TaskService.getTaskDetail(params.id, params.taskId);
    return sendResponse(res, 200, { success: true, message: "Task retrieved successfully", data: task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = createTaskSchema.parse({ params: req.params, body: req.body });
    const task = await TaskService.createTask(params.id, body);
    return sendResponse(res, 201, { success: true, message: "Task created successfully", data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateTaskSchema.parse({ params: req.params, body: req.body });
    const task = await TaskService.updateTask(params.id, params.taskId, body);
    return sendResponse(res, 200, { success: true, message: "Task updated successfully", data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { params } = deleteTaskSchema.parse({ params: req.params });
    await TaskService.deleteTask(params.id, params.taskId);
    return sendResponse(res, 200, { success: true, message: "Task deleted successfully", data: null });
});

export const assignMembers = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = assignMembersSchema.parse({ params: req.params, body: req.body });
    const task = await TaskService.assignMembers(params.id, params.taskId, body.memberIds);
    return sendResponse(res, 200, { success: true, message: "Members assigned successfully", data: task });
});
