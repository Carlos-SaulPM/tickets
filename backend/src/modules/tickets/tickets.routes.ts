import { Router } from "express";

import { recibirAdjunto } from "@/config/uploads";
import { authMiddleware } from "@/middlewares/auth.middleware";

import { AdjuntosController } from "./adjuntos.controller";
import { TicketsController } from "./tickets.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", TicketsController.listar.bind(TicketsController));
router.post("/", TicketsController.crear.bind(TicketsController));
router.get("/:id", TicketsController.obtenerPorId.bind(TicketsController));
router.patch("/:id", TicketsController.actualizar.bind(TicketsController));
router.post("/:id/asignar", TicketsController.asignar.bind(TicketsController));
router.post("/:id/adjuntos", recibirAdjunto, AdjuntosController.subir.bind(AdjuntosController));
router.patch("/:id/estado", TicketsController.cambiarEstado.bind(TicketsController));
router.post("/:id/reabrir", TicketsController.reabrir.bind(TicketsController));
router.get("/:id/mensajes", TicketsController.obtenerMensajes.bind(TicketsController));
router.post("/:id/mensajes", TicketsController.agregarMensaje.bind(TicketsController));
router.post("/:id/aprobar", TicketsController.aprobar.bind(TicketsController));
router.post("/:id/rechazar", TicketsController.rechazar.bind(TicketsController));
router.get("/:id/historial", TicketsController.obtenerHistorial.bind(TicketsController));

export default router;
