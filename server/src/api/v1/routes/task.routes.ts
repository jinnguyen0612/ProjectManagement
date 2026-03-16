import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    createTaskSchema,
    getTaskDetailSchema,
    getTasksSchema,
    updateTaskSchema,
    completeTaskSchema,
    changeTaskStatusSchema,
    assignMembersSchema,
    moveTaskSchema,
} from "../modules/task/task.schema";
import {
    createTask,
    getTaskDetail,
    getTasks,
    updateTask,
    completeTask,
    uncompleteTask,
    changeTaskStatus,
    assignMembers,
    moveTask,
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
 *       - in: query
 *         name: isCompleted
 *         schema: { type: boolean }
 *         description: Filter by completion status (true/false)
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get("/", authenticate, validate(getTasksSchema), getTasks);

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
 *             required: [name, statusId]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 500
 *               description:
 *                 type: string
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
 *               name:
 *                 type: string
 *                 maxLength: 500
 *               description:
 *                 type: string
 *                 nullable: true
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

/**
 * @swagger
 * /project/{id}/tasks/{taskId}/complete:
 *   post:
 *     summary: Mark a task as completed (Leader only)
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
 *         description: Task marked as completed
 *       403:
 *         description: Leader role required
 *       404:
 *         description: Task not found
 */
router.post("/:taskId/complete", authenticate, validate(completeTaskSchema), completeTask);

/**
 * @swagger
 * /project/{id}/tasks/{taskId}/uncomplete:
 *   post:
 *     summary: Revert task completion (Leader only)
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
 *         description: Task completion reverted
 *       403:
 *         description: Leader role required
 *       404:
 *         description: Task not found
 */
router.post("/:taskId/uncomplete", authenticate, validate(completeTaskSchema), uncompleteTask);

/**
 * @swagger
 * /project/{id}/tasks/{taskId}/change-status:
 *   post:
 *     summary: Change the status of a task
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
 *             required: [statusId]
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: ID of the target status
 *     responses:
 *       200:
 *         description: Task status changed successfully
 *       404:
 *         description: Task or status not found
 */
router.post("/:taskId/change-status", authenticate, validate(changeTaskStatusSchema), changeTaskStatus);

/**
 * @swagger
 * /project/{id}/tasks/{taskId}/move:
 *   post:
 *     summary: Move a task (drag & drop) — update status and reorder both source and target columns
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
 *             required: [newStatusId, targetOrderedIds]
 *             properties:
 *               newStatusId:
 *                 type: integer
 *                 description: Status ID of the target column (can be same as current for reorder-only)
 *               targetOrderedIds:
 *                 type: array
 *                 items: { type: integer }
 *                 description: Ordered task IDs in the target column after drop (must include the moved task)
 *                 example: [5, 1, 3]
 *               sourceOrderedIds:
 *                 type: array
 *                 items: { type: integer }
 *                 description: Ordered task IDs remaining in the source column after removing the moved task (omit if same-column reorder)
 *                 example: [2, 4]
 *     responses:
 *       200:
 *         description: Task moved successfully
 *       404:
 *         description: Task or status not found
 */
router.post("/:taskId/move", authenticate, validate(moveTaskSchema), moveTask);

export default router;
