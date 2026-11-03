import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { CreateAreaInput, UpdateAreaInput } from "./areas.schema";
import type { Area } from "./areas.types";

const areaSelect = {
  id: true,
  nombre: true,
  activo: true,
} as const;

export class AreaRepository {
  findAll(): Promise<Area[]> {
    return prisma.area.findMany({
      select: areaSelect,
      orderBy: { nombre: "asc" },
    });
  }

  findById(id: string): Promise<Area | null> {
    return prisma.area.findUnique({
      where: { id },
      select: areaSelect,
    });
  }

  create(data: CreateAreaInput): Promise<Area> {
    return prisma.area.create({
      data: {
        nombre: data.nombre,
        activo: data.activo ?? true,
      },
      select: areaSelect,
    });
  }

  async update(id: string, data: UpdateAreaInput): Promise<Area | null> {
    const updateData: Prisma.AreaUpdateManyMutationInput = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const result = await prisma.area.updateMany({
      where: { id },
      data: updateData,
    });

    if (result.count === 0) return null;

    return this.findById(id);
  }
}
