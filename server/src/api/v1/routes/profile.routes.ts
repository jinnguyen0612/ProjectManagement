import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { authLimiter } from "../../../core/config/rateLimiter";
import { changePassword, getUserProfile, updateProfile } from "../modules/profile/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { changePasswordSchema, updateProfileSchema } from "../modules/profile/profile.schema";

const router = Router();
router.use(authLimiter);

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user profile
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 */
router.get("/", authenticate, getUserProfile);

/**
 * @swagger
 * /api/v1/profile/update:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               bio:
 *                 type: string
 *                 example: Bio
 *               address:
 *                 type: string
 *                 example: Address
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile updated successfully
 *                 data:
 *                   type: object
 */
router.post("/update", authenticate, validate(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/v1/profile/change-password:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldPassword
 *               newPassword:
 *                 type: string
 *                 example: newPassword
 *               confirmPassword:
 *                 type: string
 *                 example: confirmPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *                 data:
 *                   type: object
 */
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
