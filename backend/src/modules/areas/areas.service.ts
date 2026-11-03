import { Prisma } from "@/generated/prisma/client";
import { NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";

import { AreaRepository } from "./areas.repository";
import type { CreateAreaInput, UpdateAreaInput } from "./areas.schema";

export class AreasService {
  constructor(private readonly repository: AreaRepository = new AreaRepository()) {}

  private verifyAdminRole(requestedRole?: NombreRol): void {
    if (requestedRole !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }
  }

  async getAll() {
    return this.repository.findAll();
  }

  async create(data: CreateAreaInput, requestedRole?: NombreRol) {
    this.verifyAdminRole(requestedRole);

    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "El área ya existe");
      }

      throw error;
    }
  }

  async update(id: string, data: UpdateAreaInput, requestedRole?: NombreRol) {
    this.verifyAdminRole(requestedRole);

    try {
      const area = await this.repository.update(id, data);

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
