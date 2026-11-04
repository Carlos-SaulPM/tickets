import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { UsuariosController } from "./usuarios.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", UsuariosController.crear.bind(UsuariosController));

router.patch("/:id", UsuariosController.actualizar.bind(UsuariosController));

router.delete("/:id", UsuariosController.eliminar.bind(UsuariosController));

router.get("/", UsuariosController.listar.bind(UsuariosController));

router.get("/:id", UsuariosController.obtenerPorId.bind(UsuariosController));

export default router;
