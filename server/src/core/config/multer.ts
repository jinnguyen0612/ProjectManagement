import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("ProjectManagement/image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"));
    }
};

const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith("ProjectManagement/video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only video files are allowed"));
    }
};

// Upload 1 ảnh (max 10MB)
export const uploadSingleImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

// Upload nhiều ảnh (max 10 files, mỗi file max 10MB)
export const uploadMultipleImages = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).array("images", 10);

// Upload 1 video (max 100MB)
export const uploadSingleVideo = multer({
    storage,
    fileFilter: videoFilter,
    limits: { fileSize: 100 * 1024 * 1024 },
}).single("video");
