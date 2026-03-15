import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createProjectSchema, getProjectDetailSchema, getProjectsSchema, updateProjectSchema, archiveProjectSchema, starProjectSchema } from "../modules/project/project.schema";
import { createProject, getProjectDetail, getProjects, updateProject, archiveProject, starProject, unstarProject } from "../modules/project/project.controller";
import memberRouter from "./member.routes";
import statusRouter from "./status.routes";
import taskRouter from "./task.routes";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Get list of projects
 *     tags: [Projects]
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
 *         schema: { type: string, enum: [code, name] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, ARCHIVED] }
 *       - in: query
 *         name: ownerSearch
 *         schema: { type: string }
 *       - in: query
 *         name: ownerSearchField
 *         schema: { type: string, enum: [fullname, phone, email] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [id, code, name] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get("/", authenticate, validate(getProjectsSchema), getProjects);

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Get project detail
 *     tags: [Projects]
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
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found or not a member
 */
router.get("/:id", authenticate, validate(getProjectDetailSchema), getProjectDetail);

/**
 * @swagger
 * /project/create:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
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
 *               ownerId:
 *                 type: integer
 *                 description: Defaults to current user if omitted
 *               description:
 *                 type: string
 *               bgColor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post("/create", authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), validate(createProjectSchema), createProject);

/**
 * @swagger
 * /project/update/{id}:
 *   post:
 *     summary: Update a project
 *     tags: [Projects]
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
 *               bgColor:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ARCHIVED]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Not authorized (owner or leader only)
 */
router.post("/update/:id", authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), validate(updateProjectSchema), updateProject);

/**
 * @swagger
 * /project/archive/{id}:
 *   post:
 *     summary: Archive a project (owner only)
 *     tags: [Projects]
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
 *         description: Project archived successfully
 *       400:
 *         description: Project already archived
 *       403:
 *         description: Not the project owner
 */
router.post("/archive/:id", authenticate, validate(archiveProjectSchema), archiveProject);

/**
 * @swagger
 * /project/star/{id}:
 *   post:
 *     summary: Star a project (mark as important for current user)
 *     tags: [Projects]
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
 *         description: Project starred
 */
router.post("/star/:id", authenticate, validate(starProjectSchema), starProject);

/**
 * @swagger
 * /project/unstar/{id}:
 *   post:
 *     summary: Unstar a project
 *     tags: [Projects]
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
 *         description: Project unstarred
 */
router.post("/unstar/:id", authenticate, validate(starProjectSchema), unstarProject);

router.use("/:id/members", memberRouter);
router.use("/:id/statuses", statusRouter);
router.use("/:id/tasks", taskRouter);

export default router;
