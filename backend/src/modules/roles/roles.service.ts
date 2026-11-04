import { ApiError } from "@/utils/api-error";

import { RolesRepository } from "./roles.repository";

export class RolesService {
  private repository = new RolesRepository();

  async listar() {
    return this.repository.listar();
  }

  async buscarPorId(id: string) {
    const role = await this.repository.buscarPorId(id);

    if (!role) {
      throw new ApiError(400, "El rol especificado no existe");
    }

    return role;
  }
}
