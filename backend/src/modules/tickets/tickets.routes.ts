import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { TicketsController } from "./tickets.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", TicketsController.getAll.bind(TicketsController));
router.post("/", TicketsController.create.bind(TicketsController));
router.get("/:id", TicketsController.getById.bind(TicketsController));
router.patch("/:id", TicketsController.update.bind(TicketsController));
router.post("/:id/asignar", TicketsController.assign.bind(TicketsController));
router.get("/:id/mensajes", TicketsController.getMensajes.bind(TicketsController));
router.post("/:id/mensajes", TicketsController.addMensaje.bind(TicketsController));
router.post("/:id/aprobar", TicketsController.aprobar.bind(TicketsController));
router.post("/:id/rechazar", TicketsController.rechazar.bind(TicketsController));
router.get("/:id/historial", TicketsController.getHistorial.bind(TicketsController));

export default router;
