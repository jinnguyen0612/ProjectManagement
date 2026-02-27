import { Request, Response } from "express";
import { sendError, sendResponse } from "../../../../shared/responses/sendResponse";
import { asyncHandler } from "../../../../shared/asyncHandler";
import { currentUser } from "../../../../hooks/useAuth";
import { ProfileService } from "./profile.service";

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await currentUser();

    if (!user) {
        return sendError(res, 404, "User not found");
    }

    return sendResponse(res, 200, {
        success: true,
        message: "User profile retrieved successfully",
        data: user,
    });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await currentUser();

    if (!user) {
        return sendError(res, 404, "User not found");
    }

    const updatedUser = await ProfileService.updateProfile(user.id, req.body);

    return sendResponse(res, 200, {
        success: true,
        message: "User profile updated successfully",
        data: updatedUser,
    });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const user = await currentUser();

    if (!user) {
        return sendError(res, 404, "User not found");
    }

    await ProfileService.changePassword(user.id, req.body);

    return sendResponse(res, 200, {
        success: true,
        message: "Password changed successfully",
    });
});