import * as argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/utils/api-error";

import type { Role } from "../roles/roles.types";
import { UsersService } from "./users.service";
import type { User } from "./users.types";

const adminRole: Role = {
  id: "11111111-1111-4111-8111-111111111111",
  nombre: "Administrador",
  descripcion: null,
};

const supportRole: Role = {
  id: "22222222-2222-4222-8222-222222222222",
  nombre: "Soporte",
  descripcion: null,
};

const user: User = {
  id: "33333333-3333-4333-8333-333333333333",
  nombre: "Usuario",
  apellido_paterno: "Prueba",
  apellido_materno: "Sistema",
  correo_electronico: "usuario@example.com",
  rol: { id: supportRole.id, nombre: supportRole.nombre },
  estado: "Activo",
  creado_en: new Date("2026-01-01T00:00:00.000Z"),
};

const createRepositoryMock = () => ({
  findAll: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
});

const createRolesRepositoryMock = () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
});

describe("UsersService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let rolesRepository: ReturnType<typeof createRolesRepositoryMock>;
  let service: UsersService;

  beforeEach(() => {
    repository = createRepositoryMock();
    rolesRepository = createRolesRepositoryMock();
    service = new UsersService(repository, rolesRepository);
  });

  it("permite listar usuarios al Administrador", async () => {
    repository.findAll.mockResolvedValue([user]);

    const result = await service.getAll("Administrador");

    expect(result).toEqual([user]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });

  it("rechaza listar usuarios a un rol distinto de Administrador", async () => {
    await expect(service.getAll("Soporte")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("crea un usuario con contraseña temporal hasheada", async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(user);
    rolesRepository.findById.mockResolvedValue(supportRole);

    const result = await service.createUser({
      data: {
        nombre: "Usuario",
        apellido_paterno: "Prueba",
        apellido_materno: "Sistema",
        correo_electronico: "usuario@example.com",
        rol_id: supportRole.id,
      },
      requestedRole: "Administrador",
    });

    const [, passwordHash] = repository.create.mock.calls[0] as [unknown, string];

    expect(result.correo_electronico).toBe("usuario@example.com");
    expect(result.contrasena).toHaveLength(32);
    expect(passwordHash).toMatch(/^\$argon2/);
    expect(await argon2.verify(passwordHash, result.contrasena)).toBe(true);
  });

  it("no permite asignar el rol Administrador", async () => {
    rolesRepository.findById.mockResolvedValue(adminRole);

    await expect(
      service.createUser({
        data: {
          nombre: "Otro",
          apellido_paterno: "Admin",
          apellido_materno: "Prueba",
          correo_electronico: "otro@example.com",
          rol_id: adminRole.id,
        },
        requestedRole: "Administrador",
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rechaza correo duplicado", async () => {
    rolesRepository.findById.mockResolvedValue(supportRole);
    repository.findByEmail.mockResolvedValue(user);

    await expect(
      service.createUser({
        data: {
          nombre: "Usuario",
          apellido_paterno: "Prueba",
          apellido_materno: "Sistema",
          correo_electronico: "usuario@example.com",
          rol_id: supportRole.id,
        },
        requestedRole: "Administrador",
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("no permite editar un usuario dado de baja", async () => {
    repository.findById.mockResolvedValue({ ...user, estado: "Baja" });

    await expect(
      service.editUser({
        id: user.id,
        data: { nombre: "Nuevo" },
        requestedRole: "Administrador",
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("devuelve 404 al buscar un usuario inexistente", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getById(user.id, "Administrador")).rejects.toMatchObject({
      status: 404,
    });
  });
});
