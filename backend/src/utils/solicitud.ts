import type { Request } from "express";
import { z } from "zod";

import type { UsuarioAutenticado } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

export const requerirId = (params: Request["params"]) => {
  const id = params.id;

  if (typeof id !== "string" || !z.uuid().safeParse(id).success) {
    throw new ApiError(400, "El id no es válido o no existe");
  }

  return id;
};

export const obtenerUsuario = (req: Request): UsuarioAutenticado => {
  if (!req.usuario) {
    throw new ApiError(401, "No autorizado");
  }

  return req.usuario;
};
