import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/config/env";

import { buscarUsuarioPorCorreo } from "./autenticacion.repository";
import { iniciarSesion } from "./autenticacion.service";

vi.mock("./autenticacion.repository", () => ({
  buscarUsuarioPorCorreo: vi.fn(),
}));

const mockedBuscarUsuario = vi.mocked(buscarUsuarioPorCorreo);

let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash("admin123", { type: argon2.argon2id });
});

beforeEach(() => {
  mockedBuscarUsuario.mockReset();
});

describe("iniciarSesion", () => {
  it("devuelve token y usuario con rol", async () => {
    mockedBuscarUsuario.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Admin",
      correo_electronico: "admin@example.com",
      contrasena: passwordHash,
      estado: "Activo",
      rol: { nombre: "Administrador" },
    });

    const result = await iniciarSesion({
      correo_electronico: "admin@example.com",
      contrasena: "admin123",
    });

    expect(result.usuario).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Admin",
      correo_electronico: "admin@example.com",
      rol: "Administrador",
    });

    const payload = jwt.verify(result.token, env.JWT_SECRET);

    expect(payload).toMatchObject({
      correo_electronico: "admin@example.com",
      rol: "Administrador",
    });
  });

  it("rechaza contraseña incorrecta", async () => {
    mockedBuscarUsuario.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Admin",
      correo_electronico: "admin@example.com",
      contrasena: passwordHash,
      estado: "Activo",
      rol: { nombre: "Administrador" },
    });

    await expect(
      iniciarSesion({
        correo_electronico: "admin@example.com",
        contrasena: "incorrecta",
      })
    ).rejects.toMatchObject({ status: 401 });
  });

  it("rechaza usuario inactivo", async () => {
    mockedBuscarUsuario.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Admin",
      correo_electronico: "admin@example.com",
      contrasena: passwordHash,
      estado: "Inactivo",
      rol: { nombre: "Administrador" },
    });

    await expect(
      iniciarSesion({
        correo_electronico: "admin@example.com",
        contrasena: "admin123",
      })
    ).rejects.toMatchObject({ status: 403 });
  });

  it("rechaza usuario inexistente", async () => {
    mockedBuscarUsuario.mockResolvedValue(null);

    await expect(
      iniciarSesion({
        correo_electronico: "nadie@example.com",
        contrasena: "admin123",
      })
    ).rejects.toMatchObject({ status: 401 });
  });
});
