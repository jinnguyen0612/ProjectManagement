import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createRoleSchema, getRoleDetailSchema, getRolesSchema, updateRoleSchema } from "../modules/role/role.schema";
import { createRole, getRoleDetail, getRoles, updateRole } from "../modules/role/role.controller";

const router = Router();

router.get("/", authenticate, authorize(UserRole.ADMIN), validate(getRolesSchema), getRoles);
router.get("/:id", authenticate, authorize(UserRole.ADMIN), validate(getRoleDetailSchema), getRoleDetail);

router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createRoleSchema), createRole);

router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updateRoleSchema), updateRole);

export default router;