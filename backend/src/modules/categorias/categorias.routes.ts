import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { CategoriasController } from "./categorias.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", CategoriasController.listar.bind(CategoriasController));
router.post("/", CategoriasController.crear.bind(CategoriasController));
router.patch("/:id", CategoriasController.actualizar.bind(CategoriasController));

export default router;
