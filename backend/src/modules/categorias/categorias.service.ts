import { Prisma } from "@/generated/prisma/client";
import { NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";

import { CategoriaRepository } from "./categorias.repository";
import type { CreateCategoriaInput, UpdateCategoriaInput } from "./categorias.schema";

export class CategoriasService {
  constructor(private readonly repository: CategoriaRepository = new CategoriaRepository()) {}

  private verifyAdminRole(requestedRole?: NombreRol): void {
    if (requestedRole !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }
  }

  async getAll() {
    return this.repository.findAll();
  }

  async create(data: CreateCategoriaInput, requestedRole?: NombreRol) {
    this.verifyAdminRole(requestedRole);

    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "La categoría ya existe");
      }

      throw error;
    }
  }

  async update(id: string, data: UpdateCategoriaInput, requestedRole?: NombreRol) {
    this.verifyAdminRole(requestedRole);

    try {
      const categoria = await this.repository.update(id, data);

      if (!categoria) {
        throw new ApiError(404, "No se ha encontrado la categoría");
      }

      return categoria;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "La categoría ya existe");
      }

      throw error;
    }
  }
}
