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

const router = Router({ mergeParams: true }); // mergeParams để nhận :id từ project router

router.get("/:memberId", authenticate, validate(getMemberDetailSchema), getMemberDetail);
router.post("/add", authenticate, validate(addMemberSchema), addMember);
router.post("/:memberId/remove", authenticate, validate(removeMemberSchema), removeMember);
router.post("/:memberId/role", authenticate, validate(changeMemberRoleSchema), changeMemberRole);
router.post("/:memberId/permissions", authenticate, validate(updateMemberPermissionsSchema), updateMemberPermissions);

export default router;
