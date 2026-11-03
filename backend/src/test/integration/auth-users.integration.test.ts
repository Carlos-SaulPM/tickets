import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const backendRoot = fileURLToPath(new URL("../../..", import.meta.url));

const container = new PostgreSqlContainer("postgres:17-alpine");
let started: Awaited<ReturnType<typeof container.start>>;
let app: import("express").Express;

interface LoginBody {
  token: string;
  usuario: {
    rol: string;
    correo_electronico: string;
  };
}

interface RoleDto {
  id: string;
  nombre: string;
}

interface RolesBody {
  data: RoleDto[];
}

interface UserDto {
  id: string;
  nombre: string;
  correo_electronico: string;
}

interface CreateUserBody {
  data: {
    correo_electronico: string;
    contrasena: string;
    user: UserDto;
  };
}

interface UpdateUserBody {
  data: UserDto;
}

const getBody = <T>(response: { body: unknown }): T => response.body as T;

beforeAll(async () => {
  started = await container.start();
  const databaseUrl = `${started.getConnectionUri()}?schema=public`;

  process.env.DATABASE_URL = databaseUrl;

  execSync("pnpm prisma migrate deploy", {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });

  execSync("pnpm prisma db seed", {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });

  const { createApp } = await import("@/app");
  app = createApp();
});

afterAll(async () => {
  const { prisma } = await import("@/db/prisma");
  await prisma.$disconnect();
  await started.stop();
});

const login = async (correo_electronico: string, contrasena: string) => {
  const response = await request(app)
    .post("/api/v1/autenticacion/login")
    .send({ correo_electronico, contrasena });

  return { response, body: getBody<LoginBody>(response) };
};

const getRoles = async (token: string) => {
  const response = await request(app)
    .get("/api/v1/roles")
    .set("Authorization", `Bearer ${token}`);

  return { response, body: getBody<RolesBody>(response) };
};

describe("API autenticación y usuarios", () => {
  it("inicia sesión con el Administrador del seed", async () => {
    const { response, body } = await login("admin@example.com", "admin123");

    expect(response.status).toBe(200);
    expect(body.usuario.rol).toBe("Administrador");
    expect(body.usuario.correo_electronico).toBe("admin@example.com");
  });

  it("rechaza credenciales inválidas", async () => {
    const { response } = await login("admin@example.com", "incorrecta");

    expect(response.status).toBe(401);
  });

  it("lista roles solo para Administrador", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");

    const adminRoles = await getRoles(admin.body.token);
    const supportRoles = await getRoles(support.body.token);

    expect(adminRoles.response.status).toBe(200);
    expect(adminRoles.body.data.map(role => role.nombre)).toEqual(
      expect.arrayContaining(["Administrador", "Soporte", "Usuario"])
    );
    expect(supportRoles.response.status).toBe(403);
  });

  it("crea, edita y da de baja un usuario", async () => {
    const admin = await login("admin@example.com", "admin123");
    const roles = await getRoles(admin.body.token);
    const supportRole = roles.body.data.find(role => role.nombre === "Soporte");

    expect(supportRole).toBeDefined();

    const correo = `integracion-${Date.now()}@example.com`;

    const createdResponse = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({
        nombre: "Integración",
        apellido_paterno: "Prueba",
        apellido_materno: "Sistema",
        correo_electronico: correo,
        rol_id: supportRole?.id,
      });

    const created = getBody<CreateUserBody>(createdResponse);

    expect(createdResponse.status).toBe(201);
    expect(created.data.correo_electronico).toBe(correo);
    expect(created.data.contrasena).toBeTypeOf("string");

    const userId = created.data.user.id;
    const tempPassword = created.data.contrasena;

    const updatedResponse = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre: "Integración editada" });

    const updated = getBody<UpdateUserBody>(updatedResponse);

    expect(updatedResponse.status).toBe(200);
    expect(updated.data.nombre).toBe("Integración editada");

    const removed = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(removed.status).toBe(200);

    const removedLogin = await login(correo, tempPassword);
    expect(removedLogin.response.status).toBe(403);
  });

  it("rechaza correo duplicado", async () => {
    const admin = await login("admin@example.com", "admin123");
    const roles = await getRoles(admin.body.token);
    const supportRole = roles.body.data.find(role => role.nombre === "Soporte");

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({
        nombre: "Duplicado",
        apellido_paterno: "Prueba",
        apellido_materno: "Sistema",
        correo_electronico: "admin@example.com",
        rol_id: supportRole?.id,
      });

    expect(response.status).toBe(409);
  });

  it("rechaza /users a Soporte", async () => {
    const support = await login("soporte@example.com", "soporte123");

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${support.body.token}`);

    expect(response.status).toBe(403);
  });
});
