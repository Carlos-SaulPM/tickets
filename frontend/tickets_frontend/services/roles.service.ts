import { apiFetch } from "@/lib/api";
import type { Role } from "@/types/role.types";

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const response = await apiFetch<{ data: Role[] }>("/roles");
    return response.data;
  },
};
