import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { TaskService } from "./task.service";
import {
    assignMembersSchema,
    completeTaskSchema,
    changeTaskStatusSchema,
    createTaskSchema,
    getTaskDetailSchema,
    getTasksSchema,
    updateTaskSchema,
    moveTaskSchema,
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

export const assignMembers = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = assignMembersSchema.parse({ params: req.params, body: req.body });
    const task = await TaskService.assignMembers(params.id, params.taskId, body.memberIds);
    return sendResponse(res, 200, { success: true, message: "Members assigned successfully", data: task });
});

export const completeTask = asyncHandler(async (req: Request, res: Response) => {
    const { params } = completeTaskSchema.parse({ params: req.params });
    const task = await TaskService.completeTask(params.id, params.taskId);
    return sendResponse(res, 200, { success: true, message: "Task marked as completed", data: task });
});

export const uncompleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { params } = completeTaskSchema.parse({ params: req.params });
    const task = await TaskService.uncompleteTask(params.id, params.taskId);
    return sendResponse(res, 200, { success: true, message: "Task completion reverted", data: task });
});

export const changeTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = changeTaskStatusSchema.parse({ params: req.params, body: req.body });
    const task = await TaskService.changeTaskStatus(params.id, params.taskId, body.statusId);
    return sendResponse(res, 200, { success: true, message: "Task status changed successfully", data: task });
});

export const moveTask = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = moveTaskSchema.parse({ params: req.params, body: req.body });
    const task = await TaskService.moveTask(
        params.id,
        params.taskId,
        body.newStatusId,
        body.targetOrderedIds,
        body.sourceOrderedIds
    );
    return sendResponse(res, 200, { success: true, message: "Task moved successfully", data: task });
});
