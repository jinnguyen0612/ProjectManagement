import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse, sendError } from "../../utils/response";
import { uploadToCloudinary } from "../../infrastructure/libs/cloudinary";

// Upload 1 ảnh
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
    console.log("content-type:", req.headers["content-type"]);
    console.log("file:", req.file);
    console.log("body keys:", Object.keys(req.body || {}));
    try {
        if (!req.file) {
            return sendError(res, 400, "No image file provided");
        }

        const result = await uploadToCloudinary(req.file.buffer, "images");

        return sendResponse(res, 200, {
            success: true,
            message: "Image uploaded successfully",
            data: result,
        });
    } catch (error: any) {
        return sendError(
            res,
            400,
            error?.message || "Can't upload image"
        );
    }
});

// Upload nhiều ảnh
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return sendError(res, 400, "No image files provided");
        }

        const results = await Promise.all(
            files.map((file) => uploadToCloudinary(file.buffer, "images"))
        );

        return sendResponse(res, 200, {
            success: true,
            message: `${results.length} images uploaded successfully`,
            data: results,
        });
    } catch (error: any) {
        return sendError(
            res,
            400,
            error?.message || "Can't upload images"
        );
    }
});

// Upload 1 video
export const uploadVideo = asyncHandler(async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendError(res, 400, "No video file provided");
        }

        const result = await uploadToCloudinary(req.file.buffer, "videos", "video");

        return sendResponse(res, 200, {
            success: true,
            message: "Video uploaded successfully",
            data: result,
        });
    } catch (error: any) {
        return sendError(
            res,
            400,
            error?.message || "Can't upload video"
        );
    }
});
