import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { ActualizarCategoriaInput, CrearCategoriaInput } from "./categorias.schema";

const categoriaSelect = {
  id: true,
  nombre: true,
  descripcion: true,
} as const;

export class CategoriaRepository {
  listar() {
    return prisma.categoria.findMany({
      select: categoriaSelect,
      orderBy: { nombre: "asc" },
    });
  }

  buscarPorId(id: string) {
    return prisma.categoria.findUnique({
      where: { id },
      select: categoriaSelect,
    });
  }

  crear(data: CrearCategoriaInput) {
    return prisma.categoria.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
      },
      select: categoriaSelect,
    });
  }

  async actualizar(id: string, data: ActualizarCategoriaInput) {
    const updateData: Prisma.CategoriaUpdateManyMutationInput = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;

    const result = await prisma.categoria.updateMany({
      where: { id },
      data: updateData,
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }
}
