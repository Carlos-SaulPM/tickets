import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { actualizarContrasena, login, perfil } from "./autenticacion.controller";

export const rutasAutenticacion = Router();

rutasAutenticacion.post("/login", login);
rutasAutenticacion.patch("/contrasena", authMiddleware, actualizarContrasena);
rutasAutenticacion.get("/perfil", authMiddleware, perfil);
