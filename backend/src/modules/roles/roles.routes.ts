import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { RolesController } from "./roles.controller";

const router = Router();

router.use(authMiddleware);
router.get("/", RolesController.listar.bind(RolesController));

export default router;
