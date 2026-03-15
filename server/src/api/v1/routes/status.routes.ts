import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    createStatusSchema,
    deleteStatusSchema,
    getStatusesSchema,
    reorderStatusesSchema,
    updateStatusSchema,
} from "../modules/status/status.schema";
import {
    createStatus,
    deleteStatus,
    getStatuses,
    reorderStatuses,
    updateStatus,
} from "../modules/status/status.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Statuses
 *   description: Project status management
 */

/**
 * @swagger
 * /project/{id}/statuses:
 *   get:
 *     summary: Get all statuses of a project (ordered by position)
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Statuses retrieved successfully
 */
router.get("/", authenticate, validate(getStatusesSchema), getStatuses);

/**
 * @swagger
 * /project/{id}/statuses/create:
 *   post:
 *     summary: Create a new status in the project
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
 *               bgColor:
 *                 type: string
 *                 description: Hex color code (e.g. "#3b82f6")
 *     responses:
 *       201:
 *         description: Status created successfully
 */
router.post("/create", authenticate, validate(createStatusSchema), createStatus);

/**
 * @swagger
 * /project/{id}/statuses/update/{statusId}:
 *   post:
 *     summary: Update a status
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bgColor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.post("/update/:statusId", authenticate, validate(updateStatusSchema), updateStatus);

/**
 * @swagger
 * /project/{id}/statuses/delete/{statusId}:
 *   post:
 *     summary: Delete a status
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Status deleted successfully
 */
router.post("/delete/:statusId", authenticate, validate(deleteStatusSchema), deleteStatus);

/**
 * @swagger
 * /project/{id}/statuses/reorder:
 *   post:
 *     summary: Reorder statuses by providing an ordered list of IDs
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderedIds]
 *             properties:
 *               orderedIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Status IDs in the desired order
 *                 example: [3, 1, 2]
 *     responses:
 *       200:
 *         description: Statuses reordered successfully
 */
router.post("/reorder", authenticate, validate(reorderStatusesSchema), reorderStatuses);

export default router;
