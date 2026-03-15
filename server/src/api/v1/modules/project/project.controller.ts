import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { createPaginationResponse, parseQueryParamsWithFilters } from "../../../../shared/pagination";
import { ProjectService } from "./project.service";
import { getProjectDetailSchema, updateProjectSchema, archiveProjectSchema, starProjectSchema } from "./project.schema";

export const getProjects = asyncHandler(async (req: Request, res: Response) => {

    const { page, limit, skip, search, searchField, sortBy, sortOrder, filters } =
        parseQueryParamsWithFilters(req.query);

    const ownerSearch = req.query.ownerSearch as string | undefined;
    const ownerSearchField = req.query.ownerSearchField as 'fullname' | 'phone' | 'email' | undefined;

    const { projects, total } = await ProjectService.getProjects(skip, limit, search, searchField, filters, sortBy, sortOrder, ownerSearch, ownerSearchField);

    const result = createPaginationResponse(projects, total, page, limit);

    return sendResponse(res, 200, {
        success: true,
        message: "Projects retrieved successfully",
        data: result.data,
        meta: result.pagination
    })
})

export const getProjectDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getProjectDetailSchema.parse({ params: req.params });
    const id = params.id;

    const project = await ProjectService.getProjectDetail(id);
    return sendResponse(res, 200, {
        success: true,
        message: "Project retrieved successfully",
        data: project,
    });
})

export const createProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await ProjectService.createProject(req.body);

    return sendResponse(res, 201, {
        success: true,
        message: "Project created successfully",
        data: project,
    });
})

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateProjectSchema.parse({
        params: req.params,
        body: req.body
    });
    const id = params.id;
    const project = await ProjectService.updateProject(id, body);

    return sendResponse(res, 200, {
        success: true,
        message: "Project updated successfully",
        data: project,
    });
})


export const archiveProject = asyncHandler(async (req: Request, res: Response) => {
    const { params } = archiveProjectSchema.parse({ params: req.params });

    const project = await ProjectService.archiveProject(params.id);
    return sendResponse(res, 200, {
        success: true,
        message: "Project archived successfully",
        data: project,
    });
})

export const starProject = asyncHandler(async (req: Request, res: Response) => {
    const { params } = starProjectSchema.parse({ params: req.params });
    await ProjectService.starProject(params.id);
    return sendResponse(res, 200, { success: true, message: "Project starred", data: null });
})

export const unstarProject = asyncHandler(async (req: Request, res: Response) => {
    const { params } = starProjectSchema.parse({ params: req.params });
    await ProjectService.unstarProject(params.id);
    return sendResponse(res, 200, { success: true, message: "Project unstarred", data: null });
})
