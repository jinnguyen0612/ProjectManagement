import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { blockUserSchema, createUserSchema, getUserDetailSchema, getUsersSchema, updateUserPermissionSchema, updateUserSchema } from "../modules/user/user.schema";
import { blockUser, createUser, getUserDetail, getUsers, unblockUser, updateUser, updateUserPermission } from "../modules/user/user.controller";
import { UserRole } from "../../../core/enums/role";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get list of users
 *     tags: [Users]
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
 *         name: searchField
 *         schema: { type: string, enum: [email, fullname, phone] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, blocked] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [email, fullname, createdAt, updatedAt] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/", authenticate, validate(getUsersSchema), getUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user detail
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", authenticate, validate(getUserDetailSchema), getUserDetail);

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, fullname, roleId, password, confirmPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               fullname:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 nullable: true
 *               bio:
 *                 type: string
 *               address:
 *                 type: string
 *               roleId:
 *                 type: integer
 *               password:
 *                 type: string
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *                 minLength: 6
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createUserSchema), createUser);

/**
 * @swagger
 * /user/update/{id}:
 *   post:
 *     summary: Update a user (Admin only)
 *     tags: [Users]
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
 *               fullname:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 nullable: true
 *               bio:
 *                 type: string
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *               roleId:
 *                 type: integer
 *               password:
 *                 type: string
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /user/block/{id}:
 *   get:
 *     summary: Block a user (Admin only)
 *     tags: [Users]
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
 *         description: User blocked successfully
 */
router.get("/block/:id", authenticate, authorize(UserRole.ADMIN), validate(blockUserSchema), blockUser);

/**
 * @swagger
 * /user/unblock/{id}:
 *   get:
 *     summary: Unblock a user (Admin only)
 *     tags: [Users]
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
 *         description: User unblocked successfully
 */
router.get("/unblock/:id", authenticate, authorize(UserRole.ADMIN), validate(blockUserSchema), unblockUser);

/**
 * @swagger
 * /user/update-permission/{id}:
 *   post:
 *     summary: Update user system permissions (Admin only)
 *     tags: [Users]
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
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of permission IDs to assign
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 */
router.post("/update-permission/:id", authenticate, authorize(UserRole.ADMIN), validate(updateUserPermissionSchema), updateUserPermission);

export default router;