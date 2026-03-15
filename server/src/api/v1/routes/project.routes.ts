import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../../../core/enums/role";
import { validate } from "../middlewares/validate.middleware";
import { createProjectSchema, getProjectDetailSchema, getProjectsSchema, updateProjectSchema, archiveProjectSchema } from "../modules/project/project.schema";
import { createProject, getProjectDetail, getProjects, updateProject, archiveProject } from "../modules/project/project.controller";
import memberRouter from "./member.routes";

const router = Router();

router.get("/", authenticate, validate(getProjectsSchema), getProjects);
router.get("/:id", authenticate, validate(getProjectDetailSchema), getProjectDetail);

router.post("/create", authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), validate(createProjectSchema), createProject);
router.post("/update/:id", authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), validate(updateProjectSchema), updateProject);
router.post("/archive/:id", authenticate, validate(archiveProjectSchema), archiveProject);

router.use("/:id/members", memberRouter);

export default router;