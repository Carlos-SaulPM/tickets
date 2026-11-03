import type { UserRole } from "./user.types";

export interface LoginInput {
  correo: string;
  contrasena: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
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
