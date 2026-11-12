import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import { EstadoUsuario } from "@/generated/prisma/enums";
import type {
  DatosCambioContrasena,
  DatosLogin,
  UsuarioAutenticado,
} from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import {
  actualizarContrasena,
  buscarContrasenaPorId,
  buscarUsuarioPorCorreo,
} from "./autenticacion.repository";

const firmarToken = (usuario: UsuarioAutenticado) =>
  jwt.sign(usuario, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const iniciarSesion = async (datos: DatosLogin) => {
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

  const usuarioPublico: UsuarioAutenticado = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo_electronico: usuario.correo_electronico,
    rol: usuario.rol.nombre,
  };

  return { token: firmarToken(usuarioPublico), usuario: usuarioPublico };
};

export const cambiarContrasena = async (
  usuario: UsuarioAutenticado,
  datos: DatosCambioContrasena
) => {
  const actual = await buscarContrasenaPorId(usuario.id);

  if (!actual) {
    throw new ApiError(401, "No autorizado");
  }

  const coincide = await argon2.verify(actual.contrasena, datos.actual);

  if (!coincide) {
    throw new ApiError(400, "La contraseña actual no es correcta");
  }

  const hash = await argon2.hash(datos.nueva, { type: argon2.argon2id });

  await actualizarContrasena(usuario.id, hash);
};
