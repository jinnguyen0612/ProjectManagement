import { Router } from "express";
import authRoutes from "./auth.routes";
import uploadRoutes from "./upload.routes";
import profileRoutes from "./profile.routes";
import apiKeyRoutes from "./api-key.routes";
import { validateApiKey } from "../middlewares/apiKey.middleware";

const router = Router();

// Áp dụng middleware API key cho toàn bộ routes
router.use(validateApiKey);

router.use("/auth", authRoutes);
router.use("/api-key", apiKeyRoutes);
router.use("/upload", uploadRoutes);
router.use("/profile", profileRoutes);

export default router;
