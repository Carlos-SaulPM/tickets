import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import { ApiError } from "@/utils/api-error";

import { UserRepository } from "./users.repository";
import type {
  CreateUserDTO,
  CreateUserRepositoryDTO,
  DeleteUserDTO,
  UpdateUserDTO,
  UpdateUserRepositoryDTO,
  User,
  UserRole,
} from "./users.types";

export class UsersService {
  private repository = new UserRepository();

  private verifyAdminRole(requestedRole?: UserRole): void {
    if (!requestedRole) {
      throw new ApiError(401, "No autenticado: Falta el rol de usuario");
    }
    if (requestedRole !== "Admin") {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }
  }

  private sanitizeUser(user: User): Omit<User, "password"> {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private async validateAssignableRole(id_rol: string): Promise<void> {
    const rolesCatalogoCatalogMock: Record<string, string> = {
      "rol-admin-id": "Admin",
      "rol-soporte-id": "Soporte",
      "rol-usuario-id": "Usuario",
    };

    const roleName = rolesCatalogoCatalogMock[id_rol];

    if (!roleName) {
      throw new ApiError(400, "El rol especificado no existe en el catálogo de roles");
    }

    if (roleName === "Admin") {
      throw new ApiError(403, "No está permitido asignar el rol de Administrador");
    }
  }

  private async validateArea(id_area?: string | null): Promise<void> {
    if (id_area === undefined || id_area === null) {
      return;
    }

    const areasCatalogoMock: Record<string, boolean> = {
      "area-123": true,
      "area-456": true,
    };

    if (!areasCatalogoMock[id_area]) {
      throw new ApiError(400, "El área especificada no existe");
    }
  }

  async createUser({ data, requestedRole }: CreateUserDTO) {
    this.verifyAdminRole(requestedRole);

    await this.validateAssignableRole(data.id_rol);
    await this.validateArea(data.id_area);

    const normalizedEmail = data.email.trim();
    const existingUser = await this.repository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ApiError(409, "El correo electrónico ya se encuentra registrado");
    }

    const generatedPassword = randomBytes(24).toString("base64url");
    const passwordHash = await argon2.hash(generatedPassword, {
      type: argon2.argon2id,
    });

    const newUser: CreateUserRepositoryDTO = {
      nombre: data.nombre,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      email: normalizedEmail,
      id_rol: data.id_rol,
      id_area: data.id_area ?? null,
    };

    const savedUser = await this.repository.create(newUser, passwordHash);

    return {
      usuario: savedUser.email,
      contrasena: generatedPassword,
      user: this.sanitizeUser(savedUser),
    };
  }

  async editUser({ id, data, requestedRole }: UpdateUserDTO) {
    this.verifyAdminRole(requestedRole);

    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new ApiError(404, "No existe el usuario con ese ID");
    }

    if (existingUser.estado === "Baja") {
      throw new ApiError(400, "No se puede modificar un usuario que ha sido dado de baja.");
    }

    const changes: UpdateUserRepositoryDTO = {};

    if (data.nombre !== undefined) changes.nombre = data.nombre;
    if (data.apellido_materno !== undefined) changes.apellido_materno = data.apellido_materno;
    if (data.apellido_paterno !== undefined) changes.apellido_paterno = data.apellido_paterno;
    if (data.estado !== undefined) changes.estado = data.estado;

    if (data.id_area !== undefined) {
      await this.validateArea(data.id_area);
      changes.id_area = data.id_area;
    }

    if (data.id_rol !== undefined) {
      await this.validateAssignableRole(data.id_rol);
      changes.id_rol = data.id_rol;
    }

    const updatedUser = await this.repository.update(id, changes);
    return updatedUser ? this.sanitizeUser(updatedUser) : null;
  }

  async safeDelete({ id, requestedRole }: DeleteUserDTO) {
    this.verifyAdminRole(requestedRole);

    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    return this.repository.softDelete(existingUser.id_usuario);
  }

  async getAll(requestedRole?: UserRole) {
    this.verifyAdminRole(requestedRole);

    const users = await this.repository.findAll();
    return users.map(user => this.sanitizeUser(user));
  }

  async getById(id: string, requestedRole?: UserRole) {
    this.verifyAdminRole(requestedRole);

    const user = await this.repository.findById(id);

    if (!user) {
      throw new ApiError(404, "No se ha encontrado el usuario con ese ID");
    }

    return this.sanitizeUser(user);
  }
}
