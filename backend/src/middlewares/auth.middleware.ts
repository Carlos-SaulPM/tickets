import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import type { NombreRol } from "@/generated/prisma/enums";
import type { AuthUsuario } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNombreRol = (value: unknown): value is NombreRol =>
  value === "Administrador" || value === "Soporte" || value === "Usuario";

const isAuthUsuario = (value: unknown): value is AuthUsuario => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.nombre === "string" &&
    typeof value.correo_electronico === "string" &&
    isNombreRol(value.rol)
  );
};

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "No autorizado"));
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload: unknown = jwt.verify(token, env.JWT_SECRET);

    if (!isAuthUsuario(payload)) {
      next(new ApiError(401, "No autorizado"));
      return;
    }

    req.usuario = payload;
    next();
  } catch {
    next(new ApiError(401, "No autorizado"));
  }
};
