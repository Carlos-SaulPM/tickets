import { Prisma } from "@/generated/prisma/client";
import { NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";

import { AreaRepository } from "./areas.repository";
import type { ActualizarAreaInput, CrearAreaInput } from "./areas.schema";

export class AreasService {
  constructor(private readonly repository: AreaRepository = new AreaRepository()) {}

  private verificarRolAdministrador(requestedRole?: NombreRol): void {
    if (requestedRole !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }
  }

  async listar(activo?: boolean) {
    return this.repository.listar(activo);
  }

  async crear(data: CrearAreaInput, requestedRole?: NombreRol) {
    this.verificarRolAdministrador(requestedRole);

    try {
      return await this.repository.crear(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "El área ya existe");
      }

      throw error;
    }
  }

  async actualizar(id: string, data: ActualizarAreaInput, requestedRole?: NombreRol) {
    this.verificarRolAdministrador(requestedRole);

    try {
      const area = await this.repository.actualizar(id, data);

      if (!area) {
        throw new ApiError(404, "No se ha encontrado el área");
      }

      return area;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "El área ya existe");
      }

      throw error;
    }
  }
}
