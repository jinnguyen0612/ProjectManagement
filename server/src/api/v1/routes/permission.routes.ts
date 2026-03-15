import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createPermissionSchema, getPermissionDetailSchema, getPermissionsSchema, updatePermissionSchema } from "../modules/permission/permission.schema";
import { createPermission, getPermissions, getPermissionDetail, updatePermission } from "../modules/permission/permission.controller";

const router = Router();

router.get("/", authenticate, authorize(UserRole.ADMIN), validate(getPermissionsSchema), getPermissions);
router.get("/:id", authenticate, authorize(UserRole.ADMIN), validate(getPermissionDetailSchema), getPermissionDetail);

router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createPermissionSchema), createPermission);

router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updatePermissionSchema), updatePermission);

export default router;