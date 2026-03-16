import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createPermissionSchema, getPermissionDetailSchema, getPermissionsSchema, updatePermissionSchema } from "../modules/permission/permission.schema";
import { createPermission, getPermissions, getPermissionDetail, updatePermission } from "../modules/permission/permission.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: System permission management (Admin only)
 */

/**
 * @swagger
 * /permission:
 *   get:
 *     summary: Get list of permissions
 *     tags: [Permissions]
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
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *       403:
 *         description: Admin only
 */
router.get("/", authenticate, authorize(UserRole.ADMIN), validate(getPermissionsSchema), getPermissions);

/**
 * @swagger
 * /permission/{id}:
 *   get:
 *     summary: Get permission detail
 *     tags: [Permissions]
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
router.get("/:id", authenticate, authorize(UserRole.ADMIN), validate(getPermissionDetailSchema), getPermissionDetail);

/**
 * @swagger
 * /permission/create:
 *   post:
 *     summary: Create a new permission (Admin only)
 *     tags: [Permissions]
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
 *                 description: Permission key (e.g. user.create)
 *                 example: user.create
 *               name:
 *                 type: string
 *                 example: Create User
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createPermissionSchema), createPermission);

/**
 * @swagger
 * /permission/update/{id}:
 *   post:
 *     summary: Update a permission (Admin only)
 *     tags: [Permissions]
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
router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updatePermissionSchema), updatePermission);

export default router;