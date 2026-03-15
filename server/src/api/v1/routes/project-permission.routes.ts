import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import {
    createProjectPermissionSchema,
    deleteProjectPermissionSchema,
    getProjectPermissionDetailSchema,
    getProjectPermissionsSchema,
    updateProjectPermissionSchema,
} from "../modules/project-permission/project-permission.schema";
import {
    createProjectPermission,
    deleteProjectPermission,
    getProjectPermissionDetail,
    getProjectPermissions,
    updateProjectPermission,
} from "../modules/project-permission/project-permission.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Project Permissions
 *   description: Manage project-level permission definitions (Admin only for write operations)
 */

/**
 * @swagger
 * /project-permission:
 *   get:
 *     summary: Get list of project permissions
 *     tags: [Project Permissions]
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
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [id, key, name] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Project permissions retrieved successfully
 */
router.get("/", authenticate, validate(getProjectPermissionsSchema), getProjectPermissions);

/**
 * @swagger
 * /project-permission/{id}:
 *   get:
 *     summary: Get project permission detail
 *     tags: [Project Permissions]
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
 *         description: Permission retrieved successfully
 *       404:
 *         description: Permission not found
 */
router.get("/:id", authenticate, validate(getProjectPermissionDetailSchema), getProjectPermissionDetail);

/**
 * @swagger
 * /project-permission/create:
 *   post:
 *     summary: Create a new project permission definition (Admin only)
 *     tags: [Project Permissions]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, name]
 *             properties:
 *               key:
 *                 type: string
 *                 description: Permission key using dot notation (e.g. task.create)
 *                 example: task.create
 *               name:
 *                 type: string
 *                 example: Create Task
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createProjectPermissionSchema), createProjectPermission);

/**
 * @swagger
 * /project-permission/update/{id}:
 *   post:
 *     summary: Update a project permission definition (Admin only)
 *     tags: [Project Permissions]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated successfully
 */
router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updateProjectPermissionSchema), updateProjectPermission);

/**
 * @swagger
 * /project-permission/delete/{id}:
 *   post:
 *     summary: Delete a project permission definition (Admin only)
 *     tags: [Project Permissions]
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
 *         description: Permission deleted successfully
 */
router.post("/delete/:id", authenticate, authorize(UserRole.ADMIN), validate(deleteProjectPermissionSchema), deleteProjectPermission);

export default router;
