import type { EstadoUsuario, NombreRol } from "@/generated/prisma/enums";

import type { ActualizarUsuarioInput, CrearUsuarioInput } from "./usuarios.schema";

export interface RolUsuarioResumen {
  id: string;
  nombre: NombreRol;
}

export interface Usuario {
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
  rolSolicitante: NombreRol | undefined;
  idSolicitante?: string | undefined;
}

export interface CrearUsuarioRepositoryDTO {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol_id: string;
}

export interface ActualizarUsuarioDTO {
  id: string;
  data: ActualizarUsuarioInput;
  rolSolicitante: NombreRol | undefined;
  idSolicitante: string | undefined;
}

export interface ActualizarUsuarioRepositoryDTO {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rol_id?: string;
  estado?: EstadoUsuario;
}

export interface RestablecerContrasenaDTO {
  id: string;
  rolSolicitante: NombreRol | undefined;
  idSolicitante?: string | undefined;
}

export interface EliminarUsuarioDTO {
  id: string;
  rolSolicitante: NombreRol | undefined;
  idSolicitante: string | undefined;
}
