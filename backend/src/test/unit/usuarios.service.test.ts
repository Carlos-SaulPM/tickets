import * as argon2 from "argon2";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Role } from "@/modules/roles/roles.types";
import { UsuariosService } from "@/modules/usuarios/usuarios.service";
import type { User } from "@/modules/usuarios/usuarios.types";
import { ApiError } from "@/utils/api-error";

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
  listar: vi.fn(),
  buscarPorCorreo: vi.fn(),
  buscarPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  darDeBaja: vi.fn(),
});

const createRolesRepositoryMock = () => ({
  listar: vi.fn(),
  buscarPorId: vi.fn(),
});

describe("UsuariosService", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let rolesRepository: ReturnType<typeof createRolesRepositoryMock>;
  let service: UsuariosService;

  beforeEach(() => {
    repository = createRepositoryMock();
    rolesRepository = createRolesRepositoryMock();
    service = new UsuariosService(repository, rolesRepository);
  });

  it("permite listar usuarios al Administrador", async () => {
    repository.listar.mockResolvedValue([user]);

    const result = await service.listar("Administrador");

    expect(result).toEqual([user]);
    expect(repository.listar).toHaveBeenCalledOnce();
  });

  it("rechaza listar usuarios a un rol distinto de Administrador", async () => {
    await expect(service.listar("Soporte")).rejects.toMatchObject({
      status: 403,
    });
  });

  it("crea un usuario con contraseña temporal hasheada", async () => {
    repository.buscarPorCorreo.mockResolvedValue(null);
    repository.crear.mockResolvedValue(user);
    rolesRepository.buscarPorId.mockResolvedValue(supportRole);

    const result = await service.crearUsuario({
      data: {
        nombre: "Usuario",
        apellido_paterno: "Prueba",
        apellido_materno: "Sistema",
        correo_electronico: "usuario@example.com",
        rol_id: supportRole.id,
      },
      requestedRole: "Administrador",
    });

    const [, passwordHash] = repository.crear.mock.calls[0] as [unknown, string];

    expect(result.correo_electronico).toBe("usuario@example.com");
    expect(result.contrasena).toHaveLength(32);
    expect(passwordHash).toMatch(/^\$argon2/);
    expect(await argon2.verify(passwordHash, result.contrasena)).toBe(true);
  });

  it("no permite asignar el rol Administrador", async () => {
    rolesRepository.buscarPorId.mockResolvedValue(adminRole);

    await expect(
      service.crearUsuario({
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

    expect(repository.crear).not.toHaveBeenCalled();
  });

  it("rechaza correo duplicado", async () => {
    rolesRepository.buscarPorId.mockResolvedValue(supportRole);
    repository.buscarPorCorreo.mockResolvedValue(user);

    await expect(
      service.crearUsuario({
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
    repository.buscarPorId.mockResolvedValue({ ...user, estado: "Baja" });

    await expect(
      service.actualizarUsuario({
        id: user.id,
        data: { nombre: "Nuevo" },
        requestedRole: "Administrador",
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("no permite que el Administrador se elimine a sí mismo", async () => {
    await expect(
      service.eliminar({
        id: user.id,
        requestedRole: "Administrador",
        requestedUserId: user.id,
      })
    ).rejects.toMatchObject({ status: 403 });

    expect(repository.buscarPorId).not.toHaveBeenCalled();
  });

  it("no permite que el Administrador se dé de baja a sí mismo", async () => {
    await expect(
      service.actualizarUsuario({
        id: user.id,
        data: { estado: "Baja" },
        requestedRole: "Administrador",
        requestedUserId: user.id,
      })
    ).rejects.toMatchObject({ status: 403 });

    expect(repository.buscarPorId).not.toHaveBeenCalled();
  });

  it("devuelve 404 al buscar un usuario inexistente", async () => {
    repository.buscarPorId.mockResolvedValue(null);

    await expect(service.obtenerPorId(user.id, "Administrador")).rejects.toMatchObject({
      status: 404,
    });
  });
});
