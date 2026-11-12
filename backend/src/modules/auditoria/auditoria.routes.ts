import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { AuditoriaController } from "./auditoria.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", AuditoriaController.listar.bind(AuditoriaController));

export default router;
