import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

const usuarios = [
  {
    id: randomUUID(),
    nombre: "Admin Prueba",
    correo: "admin@example.com",
    rol: "admin",
    contrasena: bcrypt.hashSync("admin123", 10),
  },
  {
    id: randomUUID(),
    nombre: "Soporte Prueba",
    correo: "soporte@example.com",
    rol: "soporte",
    contrasena: bcrypt.hashSync("soporte123", 10),
  },
  {
    id: randomUUID(),
    nombre: "Usuario Prueba",
    correo: "usuario@example.com",
    rol: "usuario",
    contrasena: bcrypt.hashSync("usuario123", 10),
  },
];

export const buscarUsuarioPorCorreo = (correo: string) =>
  usuarios.find(usuario => usuario.correo === correo);
