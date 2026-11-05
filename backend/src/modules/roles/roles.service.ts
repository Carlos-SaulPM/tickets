import { ApiError } from "@/utils/api-error";

import { RolesRepository } from "./roles.repository";

export class RolesService {
  private repository = new RolesRepository();

  async listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: string) {
    const rol = await this.repository.buscarPorId(id);

    if (!rol) {
      throw new ApiError(400, "El rol especificado no existe");
    }

    return rol;
  }
}
