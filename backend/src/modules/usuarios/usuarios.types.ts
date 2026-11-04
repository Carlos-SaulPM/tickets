import type { EstadoUsuario, NombreRol } from "@/generated/prisma/enums";

import type { ActualizarUsuarioInput, CrearUsuarioInput } from "./usuarios.schema";

export interface RolUsuarioResumen {
  id: string;
  nombre: NombreRol;
}

export interface User {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol: RolUsuarioResumen;
  estado: EstadoUsuario;
  creado_en: Date;
}

export interface CrearUsuarioDTO {
  data: CrearUsuarioInput;
  requestedRole?: NombreRol | undefined;
}

export interface CreateUsuariosRepositoryDTO {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol_id: string;
}

export interface ActualizarUsuarioDTO {
  id: string;
  data: ActualizarUsuarioInput;
  requestedRole?: NombreRol | undefined;
  requestedUserId?: string | undefined;
}

export interface UpdateUsuariosRepositoryDTO {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rol_id?: string;
  estado?: EstadoUsuario;
}

export interface EliminarUsuarioDTO {
  id: string;
  requestedRole?: NombreRol | undefined;
  requestedUserId?: string | undefined;
}
