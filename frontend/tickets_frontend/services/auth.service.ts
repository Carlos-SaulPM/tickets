import { apiFetch } from "@/lib/api";
import { clearSession, getSession, saveSession } from "@/lib/session";
import type { AuthUser, LoginInput, LoginResponse } from "@/types/auth.types";

export const authService = {
  async login(datos: LoginInput): Promise<AuthUser> {
    const response = await apiFetch<LoginResponse>("/autenticacion/login", {
      method: "POST",
      body: JSON.stringify(datos),
      auth: false,
    });

    saveSession({ token: response.token, usuario: response.usuario });

    return response.usuario;
  },

  async getPerfil(): Promise<AuthUser> {
    const response = await apiFetch<{ usuario: AuthUser }>("/autenticacion/perfil");
    return response.usuario;
  },

  logout(): void {
    clearSession();
  },

  getSession,
};
