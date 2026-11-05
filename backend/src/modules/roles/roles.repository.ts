import { prisma } from "@/db/prisma";

import type { Rol } from "./roles.types";

const rolSelect = {
  id: true,
  nombre: true,
  descripcion: true,
} as const;

export class RolesRepository {
  listar(): Promise<Rol[]> {
    return prisma.rol.findMany({
      select: rolSelect,
      orderBy: { nombre: "asc" },
    });
  }

  buscarPorId(id: string): Promise<Rol | null> {
    return prisma.rol.findUnique({
      where: { id },
      select: rolSelect,
    });
  }
}
