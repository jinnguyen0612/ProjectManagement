import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadSingleImage, uploadMultipleImages, uploadSingleVideo } from "../../../core/config/multer";
import { uploadImage, uploadImages, uploadVideo } from "../modules/upload/upload.controller";

const router = Router();

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload single image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post("/image", uploadSingleImage, uploadImage);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload multiple images (max 10)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post("/images", uploadMultipleImages, uploadImages);

/**
 * @swagger
 * /api/upload/video:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload single video
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */
router.post("/video", uploadSingleVideo, uploadVideo);

export default router;
