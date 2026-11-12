import { Prisma } from "@/generated/prisma/client";
import { AccionAuditoria, EntidadAuditoria, NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";
import { exigirAdministrador } from "@/utils/permisos";

import { auditoriaService } from "../auditoria/auditoria.service";
import { CategoriaRepository } from "./categorias.repository";
import type { ActualizarCategoriaInput, CrearCategoriaInput } from "./categorias.schema";

const esNombreDuplicado = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export class CategoriasService {
  constructor(private readonly repository: CategoriaRepository = new CategoriaRepository()) {}

  async listar(activo?: boolean) {
    return this.repository.listar(activo);
  }

  async crear(data: CrearCategoriaInput, rolSolicitante?: NombreRol, idSolicitante?: string) {
    exigirAdministrador(rolSolicitante);

    try {
      const categoria = await this.repository.crear(data);

      if (idSolicitante) {
        await auditoriaService.registrar({
          usuario_id: idSolicitante,
          accion: AccionAuditoria.CREAR,
          entidad: EntidadAuditoria.CATEGORIA,
          entidad_id: categoria.id,
          detalle: categoria.nombre,
        });
      }

      return categoria;
    } catch (error) {
      if (esNombreDuplicado(error)) {
        throw new ApiError(409, "La categoría ya existe");
      }

      throw error;
    }
  }

  async eliminar(id: string, rolSolicitante?: NombreRol, idSolicitante?: string) {
    exigirAdministrador(rolSolicitante);

    const categoria = await this.repository.buscarPorId(id);

    if (!categoria) {
      throw new ApiError(404, "No se ha encontrado la categoría");
    }

    const tickets = await this.repository.contarTickets(id);

    if (tickets > 0) {
      throw new ApiError(
        400,
        "La categoría tiene tickets asociados; se puede desactivar en lugar de eliminarla"
      );
    }

    await this.repository.eliminar(id);

    if (idSolicitante) {
      await auditoriaService.registrar({
        usuario_id: idSolicitante,
        accion: AccionAuditoria.BAJA,
        entidad: EntidadAuditoria.CATEGORIA,
        entidad_id: categoria.id,
        detalle: categoria.nombre,
      });
    }

    return categoria;
  }

  async actualizar(
    id: string,
    data: ActualizarCategoriaInput,
    rolSolicitante?: NombreRol,
    idSolicitante?: string
  ) {
    exigirAdministrador(rolSolicitante);

    try {
      const categoria = await this.repository.actualizar(id, data);

      if (!categoria) {
        throw new ApiError(404, "No se ha encontrado la categoría");
      }

      if (idSolicitante) {
        await auditoriaService.registrar({
          usuario_id: idSolicitante,
          accion: AccionAuditoria.EDITAR,
          entidad: EntidadAuditoria.CATEGORIA,
          entidad_id: categoria.id,
          detalle: categoria.nombre,
        });
      }

      return categoria;
    } catch (error) {
      if (esNombreDuplicado(error)) {
        throw new ApiError(409, "La categoría ya existe");
      }

      throw error;
    }
  }
}
