import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/Role";
import { validate } from "../middlewares/validate.middleware";
import { createClientKeySchema } from "../modules/api-key/api-key.schema";

const router = Router();

router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createClientKeySchema), )

export default router;
