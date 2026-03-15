import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { blockUserSchema, createUserSchema, getUserDetailSchema, getUsersSchema, updateUserPermissionSchema, updateUserSchema } from "../modules/user/user.schema";
import { blockUser, createUser, getUserDetail, getUsers, unblockUser, updateUser, updateUserPermission } from "../modules/user/user.controller";
import { UserRole } from "../../../core/enums/role";

const router = Router();

router.get("/", authenticate, validate(getUsersSchema), getUsers);

router.get("/:id", authenticate, validate(getUserDetailSchema), getUserDetail);

router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createUserSchema), createUser);

router.post("/update/:id", authenticate, authorize(UserRole.ADMIN), validate(updateUserSchema), updateUser);

router.get("/block/:id", authenticate, authorize(UserRole.ADMIN), validate(blockUserSchema), blockUser);
router.get("/unblock/:id", authenticate, authorize(UserRole.ADMIN), validate(blockUserSchema), unblockUser);

router.post("/update-permission/:id", authenticate, authorize(UserRole.ADMIN), validate(updateUserPermissionSchema), updateUserPermission);

export default router;