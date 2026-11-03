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
