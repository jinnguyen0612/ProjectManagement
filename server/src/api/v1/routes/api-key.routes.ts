import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createClientKeySchema, listClientKeysQuerySchema, deleteClientKeySchema } from "../modules/api-key/api-key.schema";
import { createClientKey, deleteClientKey, listClientKeys } from "../modules/api-key/api-key.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: Client API key management (Admin only)
 */

/**
 * @swagger
 * /api-key:
 *   get:
 *     summary: List all API keys
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *       403:
 *         description: Admin only
 */
router.get("/", authenticate, authorize(UserRole.ADMIN), validate(listClientKeysQuerySchema), listClientKeys);

/**
 * @swagger
 * /api-key/create:
 *   post:
 *     summary: Create a new API key (Admin only)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Descriptive name for the API key
 *                 example: Mobile App
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       description: The raw API key (only shown once)
 */
router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createClientKeySchema), createClientKey);

/**
 * @swagger
 * /api-key/delete/{id}:
 *   delete:
 *     summary: Delete an API key (Admin only)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       404:
 *         description: API key not found
 */
router.delete("/delete/:id", authenticate, authorize(UserRole.ADMIN), validate(deleteClientKeySchema), deleteClientKey);

export default router;
