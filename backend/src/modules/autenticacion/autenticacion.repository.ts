import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";

import type { UserRole } from "@/modules/users/users.types";

interface UsuarioAutenticacion {
  id: string;
  nombre: string;
  correo: string;
  rol: UserRole;
  contrasena: string;
}

type UsuarioSemilla = Omit<UsuarioAutenticacion, "id">;

const usuariosSemilla: UsuarioSemilla[] = [
  {
    nombre: "Admin Prueba",
    correo: "admin@example.com",
    rol: "Admin",
    contrasena: "admin123",
  },
  {
    nombre: "Soporte Prueba",
    correo: "soporte@example.com",
    rol: "Soporte",
    contrasena: "soporte123",
  },
  {
    nombre: "Usuario Prueba",
    correo: "usuario@example.com",
    rol: "Usuario",
    contrasena: "usuario123",
  },
];

let usuariosPromise: Promise<UsuarioAutenticacion[]> | null = null;

const obtenerUsuarios = (): Promise<UsuarioAutenticacion[]> => {
  usuariosPromise ??= Promise.all(
    usuariosSemilla.map(async usuario => ({
      ...usuario,
      id: randomUUID(),
      contrasena: await argon2.hash(usuario.contrasena, { type: argon2.argon2id }),
    }))
  );

  return usuariosPromise;
};

export const buscarUsuarioPorCorreo = async (correo: string) => {
  const usuarios = await obtenerUsuarios();
  return usuarios.find(usuario => usuario.correo === correo);
};
