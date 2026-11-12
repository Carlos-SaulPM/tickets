import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { ActualizarCategoriaInput, CrearCategoriaInput } from "./categorias.schema";

const categoriaSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  activo: true,
} as const;

export class CategoriaRepository {
  listar(activo?: boolean) {
    return prisma.categoria.findMany({
      select: categoriaSelect,
      orderBy: { nombre: "asc" },
      ...(activo === undefined ? {} : { where: { activo } }),
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
        activo: data.activo ?? true,
      },
      select: categoriaSelect,
    });
  }

  contarTickets(id: string) {
    return prisma.ticket.count({ where: { categoria_id: id } });
  }

  async eliminar(id: string) {
    const result = await prisma.categoria.deleteMany({ where: { id } });
    return result.count > 0;
  }

  async actualizar(id: string, data: ActualizarCategoriaInput) {
    const updateData: Prisma.CategoriaUpdateManyMutationInput = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const result = await prisma.categoria.updateMany({
      where: { id },
      data: updateData,
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }
}
