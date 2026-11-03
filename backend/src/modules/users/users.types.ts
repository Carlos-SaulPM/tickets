import type { CreateUserInput, UpdateUserInput } from "./users.schema";

export type UserRole = "Admin" | "Soporte" | "Usuario";

export type EstadoUsuario = "Activo" | "Inactivo" | "Baja";

export interface User {
  id_usuario: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  password: string;
  id_rol: string;
  id_area: string | null;
  estado: EstadoUsuario;
  created_at: Date;
}

export interface CreateUserDTO {
  data: CreateUserInput;
  requestedRole?: UserRole | undefined;
}

export interface CreateUserRepositoryDTO {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  id_rol: string;
  id_area: string | null;
}

export interface UpdateUserDTO {
  id: string;
  data: UpdateUserInput;
  requestedRole?: UserRole | undefined;
}

export type UpdateUserRepositoryDTO = Partial<
  Pick<User, "nombre" | "apellido_paterno" | "apellido_materno" | "id_rol" | "id_area" | "estado">
>;

export interface DeleteUserDTO {
  id: string;
  requestedRole?: UserRole | undefined;
}
