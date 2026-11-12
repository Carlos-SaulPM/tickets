import { prisma } from "@/db/prisma";

export const buscarUsuarioPorCorreo = (correo_electronico: string) =>
  prisma.usuario.findUnique({
    where: { correo_electronico },
    select: {
      id: true,
      nombre: true,
      correo_electronico: true,
      contrasena: true,
      estado: true,
      rol: {
        select: {
          nombre: true,
        },
      },
    },
  });

export const buscarContrasenaPorId = (id: string) =>
  prisma.usuario.findUnique({
    where: { id },
    select: { contrasena: true, estado: true },
  });

export const actualizarContrasena = (id: string, contrasena: string) =>
  prisma.usuario.update({
    where: { id },
    data: { contrasena },
    select: { id: true },
  });
