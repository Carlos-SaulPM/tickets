import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import type { AuthUsuario } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "No autorizado"));
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUsuario;

    req.usuario = {
      id: payload.id,
      nombre: payload.nombre,
      correo: payload.correo,
      rol: payload.rol,
    };

    next();
  } catch {
    next(new ApiError(401, "No autorizado"));
  }
};
