import { Request, Response } from "express";
import { sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { MemberService } from "./member.service";
import {
    addMemberSchema,
    changeMemberRoleSchema,
    getMemberDetailSchema,
    removeMemberSchema,
    updateMemberPermissionsSchema,
} from "./member.schema";

export const getMemberDetail = asyncHandler(async (req: Request, res: Response) => {
    const { params } = getMemberDetailSchema.parse({ params: req.params });

    const member = await MemberService.getMemberDetail(params.id, params.memberId);
    return sendResponse(res, 200, {
        success: true,
        message: "Member retrieved successfully",
        data: member,
    });
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = addMemberSchema.parse({ params: req.params, body: req.body });

    const member = await MemberService.addMember(params.id, body);
    return sendResponse(res, 201, {
        success: true,
        message: "Member added to project successfully",
        data: member,
    });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { params } = removeMemberSchema.parse({ params: req.params });

    await MemberService.removeMember(params.id, params.memberId);
    return sendResponse(res, 200, {
        success: true,
        message: "Member removed from project successfully",
        data: null,
    });
});

export const changeMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = changeMemberRoleSchema.parse({ params: req.params, body: req.body });

    const member = await MemberService.changeMemberRole(params.id, params.memberId, body.role);
    return sendResponse(res, 200, {
        success: true,
        message: "Member role updated successfully",
        data: member,
    });
});

export const updateMemberPermissions = asyncHandler(async (req: Request, res: Response) => {
    const { params, body } = updateMemberPermissionsSchema.parse({ params: req.params, body: req.body });

    const member = await MemberService.updateMemberPermissions(params.id, params.memberId, body.permissions);
    return sendResponse(res, 200, {
        success: true,
        message: "Member permissions updated successfully",
        data: member,
    });
});
