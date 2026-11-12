import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { AreasController } from "./areas.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", AreasController.listar.bind(AreasController));
router.post("/", AreasController.crear.bind(AreasController));
router.patch("/:id", AreasController.actualizar.bind(AreasController));
router.delete("/:id", AreasController.eliminar.bind(AreasController));

export default router;
