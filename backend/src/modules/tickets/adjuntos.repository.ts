import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

import type { CrearAdjuntoRepositoryDTO } from "./tickets.types";

const adjuntoSelect = {
  id: true,
  nombre_original: true,
  nombre_almacenado: true,
  tipo_mime: true,
  ruta_url: true,
  ticket: {
    select: {
      id: true,
      usuario_creador_id: true,
      asignado_a_id: true,
    },
  },
} satisfies Prisma.ArchivoAdjuntoSelect;

export class AdjuntosRepository {
  crear(data: CrearAdjuntoRepositoryDTO) {
    return prisma.archivoAdjunto.create({
      data,
      select: adjuntoSelect,
    });
  }

  buscarPorId(id: string) {
    return prisma.archivoAdjunto.findUnique({
      where: { id },
      select: adjuntoSelect,
    });
  }
}
