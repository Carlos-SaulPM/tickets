import { Prisma } from "@/generated/prisma/client";
import { NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";

import { CategoriaRepository } from "./categorias.repository";
import type { ActualizarCategoriaInput, CrearCategoriaInput } from "./categorias.schema";

export class CategoriasService {
  constructor(private readonly repository: CategoriaRepository = new CategoriaRepository()) {}

  private verificarRolAdministrador(requestedRole?: NombreRol): void {
    if (requestedRole !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }
  }

  async listar() {
    return this.repository.listar();
  }

  async crear(data: CrearCategoriaInput, requestedRole?: NombreRol) {
    this.verificarRolAdministrador(requestedRole);

    try {
      return await this.repository.crear(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "La categoría ya existe");
      }

      throw error;
    }
  }

  async actualizar(id: string, data: ActualizarCategoriaInput, requestedRole?: NombreRol) {
    this.verificarRolAdministrador(requestedRole);

    try {
      const categoria = await this.repository.actualizar(id, data);

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
