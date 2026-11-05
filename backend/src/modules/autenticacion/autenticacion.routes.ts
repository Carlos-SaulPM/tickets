import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { login, perfil } from "./autenticacion.controller";

export const rutasAutenticacion = Router();

rutasAutenticacion.post("/login", login);
rutasAutenticacion.get("/perfil", authMiddleware, perfil);
