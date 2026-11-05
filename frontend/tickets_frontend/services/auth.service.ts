import { apiFetch } from "@/lib/api";
import { guardarSesion, limpiarSesion } from "@/lib/sesion";
import type { LoginInput, LoginResponse } from "@/types/auth.types";

export const authService = {
  async login(datos: LoginInput) {
    const respuesta = await apiFetch<LoginResponse>("/autenticacion/login", {
      method: "POST",
      body: JSON.stringify(datos),
      auth: false,
    });

    guardarSesion({ token: respuesta.token, usuario: respuesta.usuario });

    return respuesta.usuario;
  },

  logout: () => limpiarSesion(),
};
