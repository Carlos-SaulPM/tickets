import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import { EstadoUsuario } from "@/generated/prisma/enums";
import type { AuthUsuario, LoginDatosEntrada } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import { buscarUsuarioPorCorreo } from "./autenticacion.repository";

const firmarToken = (usuario: AuthUsuario) =>
  jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const iniciarSesion = async (datos: LoginDatosEntrada) => {
  const usuario = await buscarUsuarioPorCorreo(datos.correo_electronico);

  if (!usuario) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const contrasenaValida = await argon2.verify(usuario.contrasena, datos.contrasena);

  if (!contrasenaValida) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  if (usuario.estado !== EstadoUsuario.Activo) {
    throw new ApiError(403, "El usuario está inactivo o dado de baja");
  }

  const usuarioPublico: AuthUsuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo_electronico: usuario.correo_electronico,
    rol: usuario.rol.nombre,
  };

  return { token: firmarToken(usuarioPublico), usuario: usuarioPublico };
};
