import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { CategoriasController } from "./categorias.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", CategoriasController.getAll.bind(CategoriasController));
router.post("/", CategoriasController.create.bind(CategoriasController));
router.patch("/:id", CategoriasController.update.bind(CategoriasController));

export default router;
