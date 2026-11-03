export type UserRole = "Admin" | "Soporte" | "Usuario";
export type EstadoUsuario = "Activo" | "Inactivo" | "Baja";

export interface User {
  id_usuario: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  id_rol: string;
  id_area: string | null;
  estado: EstadoUsuario;
  created_at: string;
}

export interface CreateUserInput {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  id_rol: string;
  id_area?: string;
}

export interface CreateUserResponse {
  usuario: string;
  contrasena: string;
  user: User;
}

export interface UpdateUserInput {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  id_rol?: string;
  id_area?: string | null;
  estado?: EstadoUsuario;
}
