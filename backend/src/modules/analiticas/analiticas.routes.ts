import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { AnaliticasController } from "./analiticas.controller";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", AnaliticasController.obtenerDashboard.bind(AnaliticasController));

export default router;
