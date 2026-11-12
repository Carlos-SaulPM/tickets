import type { Request, Response } from "express";

import { ApiError } from "@/utils/api-error";
import { validar } from "@/utils/validacion";

import { cambiarContrasena, iniciarSesion } from "./autenticacion.service";
import { cambiarContrasenaSchema, loginSchema } from "./schemas/autenticacion.schema";

export const login = async (req: Request, res: Response) => {
  const datos = validar(loginSchema, req.body);
  const resultado = await iniciarSesion(datos);

  res.status(200).json(resultado);
};

export const actualizarContrasena = async (req: Request, res: Response) => {
  if (!req.usuario) {
    throw new ApiError(401, "No autorizado");
  }

  const datos = validar(cambiarContrasenaSchema, req.body);

  await cambiarContrasena(req.usuario, datos);

  res.status(200).json({ message: "Contraseña actualizada" });
};

export const perfil = (req: Request, res: Response) => {
  if (!req.usuario) {
    throw new ApiError(401, "No autorizado");
  }

  res.status(200).json({ usuario: req.usuario });
};
