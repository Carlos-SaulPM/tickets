import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { ActualizarUsuarioRepositoryDTO, CrearUsuarioRepositoryDTO } from "./usuarios.types";

const usuarioSelect = {
  id: true,
  nombre: true,
  apellido_paterno: true,
  apellido_materno: true,
  correo_electronico: true,
  estado: true,
  creado_en: true,
  rol: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.UsuarioSelect;

export class UsuariosRepository {
  listar() {
    return prisma.usuario.findMany({
      select: usuarioSelect,
      orderBy: { creado_en: "desc" },
    });
  }

  buscarPorCorreo(correo_electronico: string) {
    return prisma.usuario.findUnique({
      where: { correo_electronico },
      select: usuarioSelect,
    });
  }

  buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: usuarioSelect,
    });
  }

  crear(data: CrearUsuarioRepositoryDTO, passwordHash: string) {
    return prisma.usuario.create({
      data: {
        ...data,
        contrasena: passwordHash,
      },
      select: usuarioSelect,
    });
  }

  actualizarContrasena(id: string, contrasena: string) {
    return prisma.usuario.update({
      where: { id },
      data: { contrasena },
      select: usuarioSelect,
    });
  }

  async actualizar(id: string, data: ActualizarUsuarioRepositoryDTO) {
    const result = await prisma.usuario.updateMany({
      where: { id },
      data,
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }

  async darDeBaja(id: string) {
    const result = await prisma.usuario.updateMany({
      where: { id },
      data: { estado: "Baja" },
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }
}
