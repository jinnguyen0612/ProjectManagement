import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);

    return sendResponse(res, 201, {
        success: true,
        message: "User registered successfully. Please verify your email to continue",
        data: user,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await AuthService.login(req.body, ipAddress, userAgent);

    return sendResponse(res, 200, {
        success: true,
        message: "Login successful",
        data: result,
    });
});

export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.resendOTP(req.body);

    return sendResponse(res, 200, {
        success: true,
        message: "OTP resent successfully",
    });
});

export const verifyRegister = asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const user = await AuthService.verifyRegister(req.body, ipAddress, userAgent);

    return sendResponse(res, 201, {
        success: true,
        message: "User verified successfully. Please login to continue",
        data: user,
    });
});
