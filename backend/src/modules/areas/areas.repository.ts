import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { ActualizarAreaInput, CrearAreaInput } from "./areas.schema";
import type { Area } from "./areas.types";

const areaSelect = {
  id: true,
  nombre: true,
  activo: true,
} as const;

export class AreaRepository {
  listar(activo?: boolean): Promise<Area[]> {
    return prisma.area.findMany({
      select: areaSelect,
      orderBy: { nombre: "asc" },
      ...(activo === undefined ? {} : { where: { activo } }),
    });
  }

  buscarPorId(id: string): Promise<Area | null> {
    return prisma.area.findUnique({
      where: { id },
      select: areaSelect,
    });
  }

  crear(data: CrearAreaInput): Promise<Area> {
    return prisma.area.create({
      data: {
        nombre: data.nombre,
        activo: data.activo ?? true,
      },
      select: areaSelect,
    });
  }

  async actualizar(id: string, data: ActualizarAreaInput): Promise<Area | null> {
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
