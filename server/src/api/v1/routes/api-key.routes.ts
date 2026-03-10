import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/Role";
import { validate } from "../middlewares/validate.middleware";
import { createClientKeySchema, listClientKeysQuerySchema, deleteClientKeySchema } from "../modules/api-key/api-key.schema";
import { createClientKey, deleteClientKey, listClientKeys } from "../modules/api-key/api-key.controller";

const router = Router();

router.get("/", authenticate, authorize(UserRole.ADMIN), validate(listClientKeysQuerySchema), listClientKeys);
router.post("/create", authenticate, authorize(UserRole.ADMIN), validate(createClientKeySchema), createClientKey);
router.delete("/delete/:id", authenticate, authorize(UserRole.ADMIN), validate(deleteClientKeySchema), deleteClientKey);

export default router;
