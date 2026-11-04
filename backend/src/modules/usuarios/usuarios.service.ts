import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import { Prisma } from "@/generated/prisma/client";
import { EstadoUsuario, NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";

import { RolesRepository } from "../roles/roles.repository";
import { UsuariosRepository } from "./usuarios.repository";
import type {
  ActualizarUsuarioDTO,
  CrearUsuarioDTO,
  CreateUsuariosRepositoryDTO,
  EliminarUsuarioDTO,
  UpdateUsuariosRepositoryDTO,
} from "./usuarios.types";

export class UsuariosService {
  constructor(
    private readonly repository: UsuariosRepository = new UsuariosRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository()
  ) {}

  private verificarRolAdministrador(requestedRole?: NombreRol): void {
    if (!requestedRole) {
      throw new ApiError(401, "No autenticado: Falta el rol de usuario");
    }

    if (requestedRole !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }
  }

  private async validarRolAsignable(rol_id: string): Promise<void> {
    const role = await this.rolesRepository.buscarPorId(rol_id);

    if (!role) {
      throw new ApiError(400, "El rol especificado no existe en el catálogo de roles");
    }

    if (role.nombre === NombreRol.Administrador) {
      throw new ApiError(403, "No está permitido asignar el rol de Administrador");
    }
  }

  async crearUsuario({ data, requestedRole }: CrearUsuarioDTO) {
    this.verificarRolAdministrador(requestedRole);
    await this.validarRolAsignable(data.rol_id);

    const normalizedEmail = data.correo_electronico.trim().toLowerCase();
    const existingUser = await this.repository.buscarPorCorreo(normalizedEmail);

    if (existingUser) {
      throw new ApiError(409, "El correo electrónico ya se encuentra registrado");
    }

    const generatedPassword = randomBytes(24).toString("base64url");
    const passwordHash = await argon2.hash(generatedPassword, {
      type: argon2.argon2id,
    });

    const newUser: CreateUsuariosRepositoryDTO = {
      nombre: data.nombre,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      correo_electronico: normalizedEmail,
      rol_id: data.rol_id,
    };

    try {
      const savedUser = await this.repository.crear(newUser, passwordHash);

      return {
        correo_electronico: savedUser.correo_electronico,
        contrasena: generatedPassword,
        user: savedUser,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "El correo electrónico ya se encuentra registrado");
      }

      throw error;
    }
  }

  async actualizarUsuario({ id, data, requestedRole, requestedUserId }: ActualizarUsuarioDTO) {
    this.verificarRolAdministrador(requestedRole);

    if (id === requestedUserId && data.estado === EstadoUsuario.Baja) {
      throw new ApiError(403, "No puedes darte de baja a ti mismo");
    }

    const existingUser = await this.repository.buscarPorId(id);

    if (!existingUser) {
      throw new ApiError(404, "No existe el usuario con ese ID");
    }

    if (existingUser.estado === EstadoUsuario.Baja) {
      throw new ApiError(400, "No se puede modificar un usuario que ha sido dado de baja.");
    }

    const changes: UpdateUsuariosRepositoryDTO = {};

    if (data.nombre !== undefined) changes.nombre = data.nombre;
    if (data.apellido_paterno !== undefined) changes.apellido_paterno = data.apellido_paterno;
    if (data.apellido_materno !== undefined) changes.apellido_materno = data.apellido_materno;
    if (data.estado !== undefined) changes.estado = data.estado;

    if (data.rol_id !== undefined) {
      await this.validarRolAsignable(data.rol_id);
      changes.rol_id = data.rol_id;
    }

    const updatedUser = await this.repository.actualizar(id, changes);

    if (!updatedUser) {
      throw new ApiError(404, "No existe el usuario con ese ID");
    }

    return updatedUser;
  }

  async eliminar({ id, requestedRole, requestedUserId }: EliminarUsuarioDTO) {
    this.verificarRolAdministrador(requestedRole);

    if (id === requestedUserId) {
      throw new ApiError(403, "No puedes eliminarte a ti mismo");
    }

    const existingUser = await this.repository.buscarPorId(id);

    if (!existingUser) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    const deletedUser = await this.repository.darDeBaja(existingUser.id);

    if (!deletedUser) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    return deletedUser;
  }

  async listar(requestedRole?: NombreRol) {
    this.verificarRolAdministrador(requestedRole);
    return this.repository.listar();
  }

  async obtenerPorId(id: string, requestedRole?: NombreRol) {
    this.verificarRolAdministrador(requestedRole);

    const user = await this.repository.buscarPorId(id);

    if (!user) {
      throw new ApiError(404, "No se ha encontrado el usuario con ese ID");
    }

    return user;
  }
}
