import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { TicketsController } from "./tickets.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", TicketsController.getNotificaciones.bind(TicketsController));
router.patch("/:id/leida", TicketsController.marcarNotificacionLeida.bind(TicketsController));

export default router;
