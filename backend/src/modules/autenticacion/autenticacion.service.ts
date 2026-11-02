import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import type { AuthUsuario, LoginDatosEntrada } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import { buscarUsuarioPorCorreo } from "./autenticacion.repository";

const firmarToken = (usuario: AuthUsuario) =>
  jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const iniciarSesion = async (datos: LoginDatosEntrada) => {
  const usuario = buscarUsuarioPorCorreo(datos.correo);

  if (!usuario) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const contrasenaValida = await bcrypt.compare(datos.contrasena, usuario.contrasena);

  if (!contrasenaValida) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const { contrasena: _hash, ...usuarioPublico } = usuario;

  return { token: firmarToken(usuarioPublico), usuario: usuarioPublico };
};
