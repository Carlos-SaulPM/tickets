import { apiFetch } from "@/lib/api";
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  CrearUsuarioResponse,
  CredencialesUsuario,
} from "@/types/usuario.types";

const RUTA_USUARIOS = "/users";

export const usuariosService = {
  crear: (data: CrearUsuarioInput) =>
    apiFetch<{ data: CrearUsuarioResponse }>(RUTA_USUARIOS, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(respuesta => respuesta.data),

  actualizar: (id: string, data: ActualizarUsuarioInput) =>
    apiFetch(`${RUTA_USUARIOS}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  eliminar: (id: string) =>
    apiFetch(`${RUTA_USUARIOS}/${id}`, {
      method: "DELETE",
    }),

  restablecerContrasena: (id: string) =>
    apiFetch<{ data: CredencialesUsuario }>(`${RUTA_USUARIOS}/${id}/contrasena`, {
      method: "POST",
    }).then(respuesta => respuesta.data),
};
