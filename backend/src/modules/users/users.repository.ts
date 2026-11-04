import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";


import type { CreateUserRepositoryDTO, UpdateUserRepositoryDTO, User } from "./users.types";

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

export class UserRepository {
  findAll(): Promise<User[]> {
    return prisma.usuario.findMany({
      select: userSelect,
      orderBy: { creado_en: "desc" },
    });
  }

  findByEmail(correo_electronico: string): Promise<User | null> {
    return prisma.usuario.findUnique({
      where: { correo_electronico },
      select: userSelect,
    });
  }

  findById(id: string): Promise<User | null> {
    return prisma.usuario.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  create(data: CreateUserRepositoryDTO, passwordHash: string): Promise<User> {
    return prisma.usuario.create({
      data: {
        ...data,
        contrasena: passwordHash,
      },
      select: userSelect,
    });
  }

  async update(id: string, data: UpdateUserRepositoryDTO): Promise<User | null> {
    const result = await prisma.usuario.updateMany({
      where: { id },
      data,
    });

    if (result.count === 0) return null;

    return this.findById(id);
  }

  async softDelete(id: string): Promise<User | null> {
    const result = await prisma.usuario.updateMany({
      where: { id },
      data: { estado: "Baja" },
    });

    if (result.count === 0) return null;

    return this.findById(id);
  }
}
