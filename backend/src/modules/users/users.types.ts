import type { EstadoUsuario, NombreRol } from "@/generated/prisma/enums";

import type { CreateUserInput, UpdateUserInput } from "./users.schema";

export interface UserRoleSummary {
  id: string;
  nombre: NombreRol;
}

export interface User {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol: UserRoleSummary;
  estado: EstadoUsuario;
  creado_en: Date;
}

export interface CreateUserDTO {
  data: CreateUserInput;
  requestedRole?: NombreRol | undefined;
}

export interface CreateUserRepositoryDTO {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol_id: string;
}

export interface UpdateUserDTO {
  id: string;
  data: UpdateUserInput;
  requestedRole?: NombreRol | undefined;
}

export interface UpdateUserRepositoryDTO {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rol_id?: string;
  estado?: EstadoUsuario;
}

export interface DeleteUserDTO {
  id: string;
  requestedRole?: NombreRol | undefined;
}
