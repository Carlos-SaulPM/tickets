import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";


import type {
  CreateUsuariosRepositoryDTO,
  UpdateUsuariosRepositoryDTO,
  User,
} from "./usuarios.types";

const userSelect = {
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
  listar(): Promise<User[]> {
    return prisma.usuario.findMany({
      select: userSelect,
      orderBy: { creado_en: "desc" },
    });
  }

  buscarPorCorreo(correo_electronico: string): Promise<User | null> {
    return prisma.usuario.findUnique({
      where: { correo_electronico },
      select: userSelect,
    });
  }

  buscarPorId(id: string): Promise<User | null> {
    return prisma.usuario.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  crear(data: CreateUsuariosRepositoryDTO, passwordHash: string): Promise<User> {
    return prisma.usuario.create({
      data: {
        ...data,
        contrasena: passwordHash,
      },
      select: userSelect,
    });
  }

  async actualizar(id: string, data: UpdateUsuariosRepositoryDTO): Promise<User | null> {
    const result = await prisma.usuario.updateMany({
      where: { id },
      data,
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }

  async darDeBaja(id: string): Promise<User | null> {
    const result = await prisma.usuario.updateMany({
      where: { id },
      data: { estado: "Baja" },
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }
}
