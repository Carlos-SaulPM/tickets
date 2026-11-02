import type { Request, Response } from "express";

import type { LoginDatosEntrada } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import { iniciarSesion } from "./autenticacion.service";

//Login
export const login = async (req: Request, res: Response) => {
  const datos = req.validated?.body as LoginDatosEntrada;
  const resultado = await iniciarSesion(datos);

  res.status(200).json(resultado);
};

export const perfil = (req: Request, res: Response) => {
  if (!req.usuario) {
    throw new ApiError(401, "No autorizado");
  }

  res.status(200).json({ usuario: req.usuario });
};
