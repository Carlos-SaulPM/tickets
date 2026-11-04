import type { RolUsuario } from "./usuario.types";

export interface LoginInput {
  correo_electronico: string;
  contrasena: string;
}

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  correo_electronico: string;
  rol: RolUsuario;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAutenticado;
}

export interface Sesion {
  token: string;
  usuario: UsuarioAutenticado;
}
