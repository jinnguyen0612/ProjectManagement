import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    assignMembersSchema,
    createTaskSchema,
    deleteTaskSchema,
    getTaskDetailSchema,
    getTasksSchema,
    updateTaskSchema,
} from "../modules/task/task.schema";
import {
    assignMembers,
    createTask,
    deleteTask,
    getTaskDetail,
    getTasks,
    updateTask,
} from "../modules/task/task.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Project task management
 */

/**
 * @swagger
 * /project/{id}/tasks:
 *   get:
 *     summary: Get tasks in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Project ID
 *       - in: query
 *         name: statusId
 *         schema: { type: integer }
 *         description: Filter by status
 *       - in: query
 *         name: memberId
 *         schema: { type: integer }
 *         description: Filter by assigned member (Members.id)
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get("/", authenticate, validate(getTasksSchema), getTasks);

/**
 * @swagger
 * /project/{id}/tasks/{taskId}:
 *   get:
 *     summary: Get task detail
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 */
router.get("/:taskId", authenticate, validate(getTaskDetailSchema), getTaskDetail);

/**
 * @swagger
 * /project/{id}/tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
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
 *             required: [statusId]
 *             properties:
 *               statusId:
 *                 type: integer
 *               bgColor:
 *                 type: string
 *               dateStart:
 *                 type: string
 *                 format: date-time
 *               dateEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post("/create", authenticate, validate(createTaskSchema), createTask);

/**
 * @swagger
 * /project/{id}/tasks/update/{taskId}:
 *   post:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statusId:
 *                 type: integer
 *               bgColor:
 *                 type: string
 *               dateStart:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               dateEnd:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               position:
 *                 type: integer
 *                 description: Position/order within the status column
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.post("/update/:taskId", authenticate, validate(updateTaskSchema), updateTask);

/**
 * @swagger
 * /project/{id}/tasks/delete/{taskId}:
 *   post:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.post("/delete/:taskId", authenticate, validate(deleteTaskSchema), deleteTask);

/**
 * @swagger
 * /project/{id}/tasks/{taskId}/assign:
 *   post:
 *     summary: Assign (or replace) members on a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberIds]
 *             properties:
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of Members.id to assign. Pass empty array to unassign all.
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Members assigned successfully
 */
router.post("/:taskId/assign", authenticate, validate(assignMembersSchema), assignMembers);

export default router;
