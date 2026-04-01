import { Router } from "express";
import authRoutes from "./auth.routes";
import uploadRoutes from "./upload.routes";
import profileRoutes from "./profile.routes";
import apiKeyRoutes from "./api-key.routes";
import userRoutes from "./user.routes"
import roleRoutes from "./role.routes"
import permissionRoutes from "./permission.routes"
import projectRoutes from "./project.routes"
import projectPermissionRoutes from "./project-permission.routes"
import { validateApiKey } from "../middlewares/apiKey.middleware";
const router = Router();

router.use(validateApiKey);

router.use("/auth", authRoutes);
router.use("/api-key", apiKeyRoutes);
router.use("/upload", uploadRoutes);
router.use("/profile", profileRoutes);
router.use("/user", userRoutes)
router.use("/role", roleRoutes)
router.use("/permission", permissionRoutes)
router.use("/project", projectRoutes)
router.use("/project-permission", projectPermissionRoutes)

export default router;
