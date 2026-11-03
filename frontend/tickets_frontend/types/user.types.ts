export type UserRole = "Administrador" | "Soporte" | "Usuario";
export type EstadoUsuario = "Activo" | "Inactivo" | "Baja";

export interface UserRoleSummary {
  id: string;
  nombre: UserRole;
}

export interface User {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol: UserRoleSummary;
  estado: EstadoUsuario;
  creado_en: string;
}

export interface CreateUserInput {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol_id: string;
}

export interface CreateUserResponse {
  correo_electronico: string;
  contrasena: string;
  user: User;
}

export interface UpdateUserInput {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rol_id?: string;
  estado?: EstadoUsuario;
}
