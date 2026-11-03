import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate";

import { login, perfil } from "./autenticacion.controller";
import { loginSchema } from "./schemas/autenticacion.schema";

export const rutasAutenticacion = Router();

rutasAutenticacion.post("/login", validate(loginSchema), login);
rutasAutenticacion.get("/perfil", authMiddleware, perfil);
