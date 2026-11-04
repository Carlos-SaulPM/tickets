import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { AdjuntosController } from "./adjuntos.controller";

const router = Router();

router.use(authMiddleware);

router.get("/:id", AdjuntosController.descargar.bind(AdjuntosController));

export default router;
