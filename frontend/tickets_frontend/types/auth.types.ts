import type { UserRole } from "./user.types";

export interface LoginInput {
  correo_electronico: string;
  contrasena: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  correo_electronico: string;
  rol: UserRole;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

export interface Session {
  token: string;
  usuario: AuthUser;
}
