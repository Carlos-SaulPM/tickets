import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { RegistrarAuditoriaDTO } from "./auditoria.types";

const auditoriaSelect = {
  id: true,
  accion: true,
  entidad: true,
  entidad_id: true,
  detalle: true,
  creado_en: true,
  usuario: {
    select: {
      id: true,
      nombre: true,
      apellido_paterno: true,
    },
  },
} satisfies Prisma.AuditoriaSelect;

export class AuditoriaRepository {
  crear(data: RegistrarAuditoriaDTO) {
    return prisma.auditoria.create({
      data: {
        usuario_id: data.usuario_id,
        accion: data.accion,
        entidad: data.entidad,
        entidad_id: data.entidad_id,
        detalle: data.detalle ?? null,
      },
      select: auditoriaSelect,
    });
  }

  async listarPaginado(where: Prisma.AuditoriaWhereInput, skip: number, take: number) {
    const [total, registros] = await prisma.$transaction([
      prisma.auditoria.count({ where }),
      prisma.auditoria.findMany({
        where,
        select: auditoriaSelect,
        orderBy: [{ creado_en: "desc" }, { id: "asc" }],
        skip,
        take,
      }),
    ]);

    return { total, registros };
  }
}
