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

router.get("/", authenticate, validate(getProjectPermissionsSchema), getProjectPermissions);
router.get("/:id", authenticate, validate(getProjectPermissionDetailSchema), getProjectPermissionDetail);

router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createProjectPermissionSchema), createProjectPermission);
router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updateProjectPermissionSchema), updateProjectPermission);
router.post("/delete/:id", authenticate, authorize(UserRole.ADMIN), validate(deleteProjectPermissionSchema), deleteProjectPermission);

export default router;
