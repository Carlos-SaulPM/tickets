import { ApiError } from "@/utils/api-error";

import { RoleRepository } from "./roles.repository";

export class RolesService {
  private repository = new RoleRepository();

  async getAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const role = await this.repository.findById(id);

    if (!role) {
      throw new ApiError(400, "El rol especificado no existe");
    }

    return role;
  }
}
