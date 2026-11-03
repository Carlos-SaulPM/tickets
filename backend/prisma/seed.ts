import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

import { PrismaClient } from "../src/generated/prisma/client";
import { EstadoUsuario, NombreRol } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es requerida para ejecutar el seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const roles: Array<{ nombre: NombreRol; descripcion: string }> = [
  { nombre: NombreRol.Administrador, descripcion: "Control total del sistema" },
  { nombre: NombreRol.Soporte, descripcion: "Atención y seguimiento de tickets" },
  { nombre: NombreRol.Usuario, descripcion: "Usuario final que reporta tickets" },
];

const areas = ["Sistemas", "Soporte"];

const categorias = [
  { nombre: "Hardware", descripcion: "Equipos y periféricos" },
  { nombre: "Software", descripcion: "Aplicaciones y sistemas" },
  { nombre: "Acceso", descripcion: "Cuentas y permisos" },
];

const usuarios = [
  {
    nombre: "Admin",
    apellido_paterno: "Prueba",
    apellido_materno: "Sistema",
    correo_electronico: "admin@example.com",
    contrasena: "admin123",
    rol: NombreRol.Administrador,
  },
  {
    nombre: "Soporte",
    apellido_paterno: "Prueba",
    apellido_materno: "Sistema",
    correo_electronico: "soporte@example.com",
    contrasena: "soporte123",
    rol: NombreRol.Soporte,
  },
  {
    nombre: "Usuario",
    apellido_paterno: "Prueba",
    apellido_materno: "Sistema",
    correo_electronico: "usuario@example.com",
    contrasena: "usuario123",
    rol: NombreRol.Usuario,
  },
];

const main = async () => {
  const rolesPorNombre = new Map<NombreRol, string>();

  for (const rol of roles) {
    const guardado = await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: rol,
    });

    rolesPorNombre.set(guardado.nombre, guardado.id);
  }

  for (const nombre of areas) {
    await prisma.area.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: categoria.nombre },
      update: { descripcion: categoria.descripcion },
      create: categoria,
    });
  }

  for (const usuario of usuarios) {
    const rol_id = rolesPorNombre.get(usuario.rol);

    if (!rol_id) {
      throw new Error(`No se encontró el rol ${usuario.rol}`);
    }

    const contrasena = await argon2.hash(usuario.contrasena, {
      type: argon2.argon2id,
    });

    await prisma.usuario.upsert({
      where: { correo_electronico: usuario.correo_electronico },
      update: {
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        contrasena,
        rol_id,
        estado: EstadoUsuario.Activo,
      },
      create: {
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        correo_electronico: usuario.correo_electronico,
        contrasena,
        rol_id,
        estado: EstadoUsuario.Activo,
      },
    });
  }

  console.log("Seed completado.");
};

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
