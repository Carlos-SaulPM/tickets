import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import { usuarioAutenticadoSchema } from "@/modules/autenticacion/schemas/autenticacion.schema";
import { ApiError } from "@/utils/api-error";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "No autorizado"));
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const usuario = usuarioAutenticadoSchema.safeParse(payload);

    if (!usuario.success) {
      next(new ApiError(401, "No autorizado"));
      return;
    }

    req.usuario = usuario.data;
    next();
  } catch {
    next(new ApiError(401, "No autorizado"));
  }
};
