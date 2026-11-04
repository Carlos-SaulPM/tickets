import type { Request } from "express";
import { z } from "zod";

import type { UsuarioAutenticado } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

export const obtenerId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export const obtenerUsuario = (req: Request): UsuarioAutenticado => {
  if (!req.usuario) {
    throw new ApiError(401, "No autorizado");
  }

  return req.usuario;
};
