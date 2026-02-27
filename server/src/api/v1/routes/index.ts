import { Router } from "express";
import authRoutes from "./auth.routes";
import uploadRoutes from "./upload.routes";
import profileRoutes from "./profile.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/profile", profileRoutes);

export default router;
