import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { ActualizarAreaInput, CrearAreaInput } from "./areas.schema";

const areaSelect = {
  id: true,
  nombre: true,
  activo: true,
} as const;

export class AreaRepository {
  listar(activo?: boolean) {
    return prisma.area.findMany({
      select: areaSelect,
      orderBy: { nombre: "asc" },
      ...(activo === undefined ? {} : { where: { activo } }),
    });
  }

  buscarPorId(id: string) {
    return prisma.area.findUnique({
      where: { id },
      select: areaSelect,
    });
  }

  crear(data: CrearAreaInput) {
    return prisma.area.create({
      data: {
        nombre: data.nombre,
        activo: data.activo ?? true,
      },
      select: areaSelect,
    });
  }

  contarTickets(id: string) {
    return prisma.ticket.count({ where: { area_id: id } });
  }

  async eliminar(id: string) {
    const result = await prisma.area.deleteMany({ where: { id } });
    return result.count > 0;
  }

  async actualizar(id: string, data: ActualizarAreaInput) {
    const updateData: Prisma.AreaUpdateManyMutationInput = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const result = await prisma.area.updateMany({
      where: { id },
      data: updateData,
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }
}
