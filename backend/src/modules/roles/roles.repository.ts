import { prisma } from "@/db/prisma";

import type { Role } from "./roles.types";

const roleSelect = {
  id: true,
  nombre: true,
  descripcion: true,
} as const;

export class RoleRepository {
  findAll(): Promise<Role[]> {
    return prisma.rol.findMany({
      select: roleSelect,
      orderBy: { nombre: "asc" },
    });
  }

  findById(id: string): Promise<Role | null> {
    return prisma.rol.findUnique({
      where: { id },
      select: roleSelect,
    });
  }
}
