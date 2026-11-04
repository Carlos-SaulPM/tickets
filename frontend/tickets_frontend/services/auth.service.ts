import { apiFetch } from "@/lib/api";
import { guardarSesion, limpiarSesion, obtenerSesion } from "@/lib/sesion";
import type { LoginInput, LoginResponse, UsuarioAutenticado } from "@/types/auth.types";

export const authService = {
  async login(datos: LoginInput): Promise<UsuarioAutenticado> {
    const response = await apiFetch<LoginResponse>("/autenticacion/login", {
      method: "POST",
      body: JSON.stringify(datos),
      auth: false,
    });

    guardarSesion({ token: response.token, usuario: response.usuario });

    return response.usuario;
  },

  async getPerfil(): Promise<UsuarioAutenticado> {
    const response = await apiFetch<{ usuario: UsuarioAutenticado }>("/autenticacion/perfil");
    return response.usuario;
  },

  logout(): void {
    limpiarSesion();
  },

  obtenerSesion,
};
