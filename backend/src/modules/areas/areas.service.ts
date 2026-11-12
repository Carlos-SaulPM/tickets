import { Prisma } from "@/generated/prisma/client";
import { AccionAuditoria, EntidadAuditoria, NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";
import { exigirAdministrador } from "@/utils/permisos";

import { auditoriaService } from "../auditoria/auditoria.service";
import { AreaRepository } from "./areas.repository";
import type { ActualizarAreaInput, CrearAreaInput } from "./areas.schema";

const esNombreDuplicado = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export class AreasService {
  constructor(private readonly repository: AreaRepository = new AreaRepository()) {}

  async listar(activo?: boolean) {
    return this.repository.listar(activo);
  }

  async crear(data: CrearAreaInput, rolSolicitante?: NombreRol, idSolicitante?: string) {
    exigirAdministrador(rolSolicitante);

    try {
      const area = await this.repository.crear(data);

      if (idSolicitante) {
        await auditoriaService.registrar({
          usuario_id: idSolicitante,
          accion: AccionAuditoria.CREAR,
          entidad: EntidadAuditoria.AREA,
          entidad_id: area.id,
          detalle: area.nombre,
        });
      }

      return area;
    } catch (error) {
      if (esNombreDuplicado(error)) {
        throw new ApiError(409, "El área ya existe");
      }

      throw error;
    }
  }

  async eliminar(id: string, rolSolicitante?: NombreRol, idSolicitante?: string) {
    exigirAdministrador(rolSolicitante);

    const area = await this.repository.buscarPorId(id);

    if (!area) {
      throw new ApiError(404, "No se ha encontrado el área");
    }

    const tickets = await this.repository.contarTickets(id);

    if (tickets > 0) {
      throw new ApiError(
        400,
        "El área tiene tickets asociados; se puede desactivar en lugar de eliminarla"
      );
    }

    await this.repository.eliminar(id);

    if (idSolicitante) {
      await auditoriaService.registrar({
        usuario_id: idSolicitante,
        accion: AccionAuditoria.BAJA,
        entidad: EntidadAuditoria.AREA,
        entidad_id: area.id,
        detalle: area.nombre,
      });
    }

    return area;
  }

  async actualizar(
    id: string,
    data: ActualizarAreaInput,
    rolSolicitante?: NombreRol,
    idSolicitante?: string
  ) {
    exigirAdministrador(rolSolicitante);

    try {
      const area = await this.repository.actualizar(id, data);

      if (!area) {
        throw new ApiError(404, "No se ha encontrado el área");
      }

      if (idSolicitante) {
        await auditoriaService.registrar({
          usuario_id: idSolicitante,
          accion: AccionAuditoria.EDITAR,
          entidad: EntidadAuditoria.AREA,
          entidad_id: area.id,
          detalle: area.nombre,
        });
      }

      return area;
    } catch (error) {
      if (esNombreDuplicado(error)) {
        throw new ApiError(409, "El área ya existe");
      }

      throw error;
    }
  }
}
