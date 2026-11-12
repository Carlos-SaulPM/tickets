import type { NombreRol } from "@/generated/prisma/enums";
import { exigirAdministrador } from "@/utils/permisos";

import { AuditoriaRepository } from "./auditoria.repository";
import type { ListarAuditoriaQuery } from "./auditoria.schema";
import type { RegistrarAuditoriaDTO } from "./auditoria.types";

export class AuditoriaService {
  constructor(private readonly repository: AuditoriaRepository = new AuditoriaRepository()) {}

  async registrar(datos: RegistrarAuditoriaDTO): Promise<void> {
    await this.repository.crear(datos);
  }

  async listar(rolSolicitante: NombreRol | undefined, filtros: ListarAuditoriaQuery) {
    exigirAdministrador(rolSolicitante);

    const skip = (filtros.pagina - 1) * filtros.limite;
    const { total, registros } = await this.repository.listarPaginado(
      filtros.entidad ? { entidad: filtros.entidad } : {},
      skip,
      filtros.limite
    );

    return {
      data: registros,
      meta: {
        pagina: filtros.pagina,
        limite: filtros.limite,
        total,
        total_paginas: Math.ceil(total / filtros.limite),
      },
    };
  }
}

export const auditoriaService = new AuditoriaService();
