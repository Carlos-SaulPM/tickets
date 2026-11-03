import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { CreateCategoriaInput, UpdateCategoriaInput } from "./categorias.schema";
import type { Categoria } from "./categorias.types";

const categoriaSelect = {
  id: true,
  nombre: true,
  descripcion: true,
} as const;

export class CategoriaRepository {
  findAll(): Promise<Categoria[]> {
    return prisma.categoria.findMany({
      select: categoriaSelect,
      orderBy: { nombre: "asc" },
    });
  }

  findById(id: string): Promise<Categoria | null> {
    return prisma.categoria.findUnique({
      where: { id },
      select: categoriaSelect,
    });
  }

  create(data: CreateCategoriaInput): Promise<Categoria> {
    return prisma.categoria.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
      },
      select: categoriaSelect,
    });
  }

  async update(id: string, data: UpdateCategoriaInput): Promise<Categoria | null> {
    const updateData: Prisma.CategoriaUpdateManyMutationInput = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;

    const result = await prisma.categoria.updateMany({
      where: { id },
      data: updateData,
    });

    if (result.count === 0) return null;

    return this.findById(id);
  }
}
