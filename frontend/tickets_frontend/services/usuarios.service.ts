import { apiFetch } from "@/lib/api";
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  CrearUsuarioResponse,
  Usuario,
} from "@/types/usuario.types";

const USERS_PATH = "/users";

export const usuariosService = {
  async listar(): Promise<Usuario[]> {
    const response = await apiFetch<{ data: Usuario[] }>(USERS_PATH);
    return response.data;
  },

  async obtenerPorId(id: string): Promise<Usuario> {
    const response = await apiFetch<{ data: Usuario }>(`${USERS_PATH}/${id}`);
    return response.data;
  },

  async crear(data: CrearUsuarioInput): Promise<CrearUsuarioResponse> {
    const response = await apiFetch<{ data: CrearUsuarioResponse }>(USERS_PATH, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  },

  async actualizar(id: string, data: ActualizarUsuarioInput): Promise<void> {
    await apiFetch(`${USERS_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async eliminar(id: string): Promise<void> {
    await apiFetch(`${USERS_PATH}/${id}`, {
      method: "DELETE",
    });
  },
};
