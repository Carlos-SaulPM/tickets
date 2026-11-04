import { apiFetch } from "@/lib/api";
import type { Rol } from "@/types/rol.types";

export const rolesService = {
  async listar(): Promise<Rol[]> {
    const response = await apiFetch<{ data: Rol[] }>("/roles");
    return response.data;
  },
};
