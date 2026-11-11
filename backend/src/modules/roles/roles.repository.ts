import { prisma } from "@/db/prisma";

const rolSelect = {
  id: true,
  nombre: true,
  descripcion: true,
} as const;

export class RolesRepository {
  listar() {
    return prisma.rol.findMany({
      select: rolSelect,
      orderBy: { nombre: "asc" },
    });
  }

  buscarPorId(id: string) {
    return prisma.rol.findUnique({
      where: { id },
      select: rolSelect,
    });
  }
}
