export type RolUsuario = "Administrador" | "Soporte" | "Usuario";
export type EstadoUsuario = "Activo" | "Inactivo" | "Baja";

export interface RolUsuarioResumen {
  id: string;
  nombre: RolUsuario;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol: RolUsuarioResumen;
  estado: EstadoUsuario;
  creado_en: string;
}

export interface CrearUsuarioInput {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  rol_id: string;
}

export interface CredencialesUsuario {
  correo_electronico: string;
  contrasena: string;
}

export interface CrearUsuarioResponse extends CredencialesUsuario {
  user: Usuario;
}

export interface ActualizarUsuarioInput {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  rol_id?: string;
  estado?: EstadoUsuario;
}
