import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createRoleSchema, getRoleDetailSchema, getRolesSchema, updateRoleSchema } from "../modules/role/role.schema";
import { createRole, getRoleDetail, getRoles, updateRole } from "../modules/role/role.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: System role management (Admin only)
 */

/**
 * @swagger
 * /role:
 *   get:
 *     summary: Get list of roles
 *     tags: [Roles]
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
 *         description: Roles retrieved successfully
 *       403:
 *         description: Admin only
 */
router.get("/", authenticate, authorize(UserRole.ADMIN), validate(getRolesSchema), getRoles);

/**
 * @swagger
 * /role/{id}:
 *   get:
 *     summary: Get role detail
 *     tags: [Roles]
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
 *         description: Role retrieved successfully
 *       404:
 *         description: Role not found
 */
router.get("/:id", authenticate, authorize(UserRole.ADMIN), validate(getRoleDetailSchema), getRoleDetail);

/**
 * @swagger
 * /role/create:
 *   post:
 *     summary: Create a new role (Admin only)
 *     tags: [Roles]
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
 *                 example: MANAGER
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createRoleSchema), createRole);

/**
 * @swagger
 * /role/update/{id}:
 *   post:
 *     summary: Update a role (Admin only)
 *     tags: [Roles]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updateRoleSchema), updateRole);

export default router;