import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    addMemberSchema,
    changeMemberRoleSchema,
    getMemberDetailSchema,
    removeMemberSchema,
    updateMemberPermissionsSchema,
} from "../modules/member/member.schema";
import {
    addMember,
    changeMemberRole,
    getMemberDetail,
    removeMember,
    updateMemberPermissions,
} from "../modules/member/member.controller";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Project member management
 */

/**
 * @swagger
 * /project/{id}/members/{memberId}:
 *   get:
 *     summary: Get member detail (includes user info and permissions)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Project ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: integer }
 *         description: Member ID (Members.id, not Users.id)
 *     responses:
 *       200:
 *         description: Member detail retrieved successfully
 *       404:
 *         description: Member not found
 */
router.get("/:memberId", authenticate, validate(getMemberDetailSchema), getMemberDetail);

/**
 * @swagger
 * /project/{id}/members/add:
 *   post:
 *     summary: Add a user to the project
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Users.id of the user to add
 *               role:
 *                 type: string
 *                 enum: [LEADER, MEMBER, VIEWER]
 *                 default: MEMBER
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: User is already a member
 */
router.post("/add", authenticate, validate(addMemberSchema), addMember);

/**
 * @swagger
 * /project/{id}/members/{memberId}/remove:
 *   post:
 *     summary: Remove a member from the project
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: integer }
 *         description: Member ID (Members.id)
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       403:
 *         description: Not authorized
 */
router.post("/:memberId/remove", authenticate, validate(removeMemberSchema), removeMember);

/**
 * @swagger
 * /project/{id}/members/{memberId}/role:
 *   post:
 *     summary: Change a member's role in the project
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: integer }
 *         description: Member ID (Members.id)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [LEADER, MEMBER, VIEWER]
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.post("/:memberId/role", authenticate, validate(changeMemberRoleSchema), changeMemberRole);

/**
 * @swagger
 * /project/{id}/members/{memberId}/permissions:
 *   post:
 *     summary: Override member permissions (grant or deny specific project permissions)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: integer }
 *         description: Member ID (Members.id)
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
 *                   type: object
 *                   required: [projectPermissionId, isDeny]
 *                   properties:
 *                     projectPermissionId:
 *                       type: integer
 *                     isDeny:
 *                       type: boolean
 *                       description: true = deny, false = grant
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 */
router.post("/:memberId/permissions", authenticate, validate(updateMemberPermissionsSchema), updateMemberPermissions);

export default router;
