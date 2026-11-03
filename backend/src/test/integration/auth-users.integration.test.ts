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
    id: string;
    nombre: string;
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

interface AreaDto {
  id: string;
  nombre: string;
  activo: boolean;
}

interface AreaListBody {
  data: AreaDto[];
}

interface AreaBody {
  data: AreaDto;
}

interface CategoriaDto {
  id: string;
  nombre: string;
}

interface CategoriaListBody {
  data: CategoriaDto[];
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
  const response = await request(app).get("/api/v1/roles").set("Authorization", `Bearer ${token}`);

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
    expect(adminRoles.response.headers.etag).toBeUndefined();
    expect(adminRoles.response.headers["cache-control"]).toBe("no-store");
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
  it("no permite que el Administrador se elimine a sí mismo", async () => {
    const admin = await login("admin@example.com", "admin123");

    const response = await request(app)
      .delete(`/api/v1/users/${admin.body.usuario.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(response.status).toBe(403);
  });
});

describe("API catálogos", () => {
  it("lista áreas y categorías para cualquier usuario autenticado", async () => {
    const support = await login("soporte@example.com", "soporte123");

    const areas = await request(app)
      .get("/api/v1/areas")
      .set("Authorization", `Bearer ${support.body.token}`);
    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${support.body.token}`);

    const areaBody = getBody<AreaListBody>(areas);
    const categoriaBody = getBody<CategoriaListBody>(categorias);

    expect(areas.status).toBe(200);
    expect(areaBody.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ nombre: "Sistemas" })])
    );
    expect(categorias.status).toBe(200);
    expect(categoriaBody.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ nombre: "Hardware" })])
    );
  });

  it("permite crear y editar un área al Administrador", async () => {
    const admin = await login("admin@example.com", "admin123");
    const nombre = `Área ${Date.now()}`;

    const created = await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre });

    const createdBody = getBody<AreaBody>(created);

    expect(created.status).toBe(201);
    expect(createdBody.data.nombre).toBe(nombre);

    const updated = await request(app)
      .patch(`/api/v1/areas/${createdBody.data.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ activo: false });

    const updatedBody = getBody<AreaBody>(updated);

    expect(updated.status).toBe(200);
    expect(updatedBody.data.activo).toBe(false);
  });

  it("rechaza crear catálogos a Soporte", async () => {
    const support = await login("soporte@example.com", "soporte123");

    const area = await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ nombre: `No permitida ${Date.now()}` });

    const categoria = await request(app)
      .post("/api/v1/categorias")
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ nombre: `No permitida ${Date.now()}` });

    expect(area.status).toBe(403);
    expect(categoria.status).toBe(403);
  });

  it("rechaza nombres duplicados", async () => {
    const admin = await login("admin@example.com", "admin123");

    const response = await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre: "Sistemas" });

    expect(response.status).toBe(409);
  });
});

interface TicketDto {
  id: string;
  codigo: string;
  estado: string;
  asignado_a: { id: string } | null;
  usuario_creador: { id: string };
}

interface TicketBody {
  data: TicketDto;
}

interface TicketListBody {
  data: TicketDto[];
}

interface MensajeDto {
  id: string;
  es_nota_interna: boolean;
  es_propuesta_solucion: boolean;
}

interface MensajeListBody {
  data: MensajeDto[];
}

interface NotificacionDto {
  id: string;
  leida: boolean;
}

interface NotificacionListBody {
  data: NotificacionDto[];
}

describe("API tickets", () => {
  it("crea, asigna, propone y aprueba un ticket", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const areas = await request(app)
      .get("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`);

    const categoria = getBody<{ data: Array<{ id: string; nombre: string }> }>(
      categorias
    ).data.find(item => item.nombre === "Hardware");
    const area = getBody<{ data: Array<{ id: string; nombre: string }> }>(areas).data.find(
      item => item.nombre === "Sistemas"
    );

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "No enciende la computadora",
        descripcion: "La computadora no enciende desde ayer.",
        categoria_id: categoria?.id,
        area_id: area?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    expect(created.status).toBe(201);
    expect(ticket.codigo).toMatch(/^#TK-\d{3}$/);
    expect(ticket.estado).toBe("Abierto");

    const userTickets = await request(app)
      .get("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const supportTickets = await request(app)
      .get("/api/v1/tickets")
      .set("Authorization", `Bearer ${support.body.token}`);
    const adminTickets = await request(app)
      .get("/api/v1/tickets")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(getBody<TicketListBody>(userTickets).data.some(item => item.id === ticket.id)).toBe(
      true
    );
    expect(getBody<TicketListBody>(supportTickets).data.some(item => item.id === ticket.id)).toBe(
      true
    );
    expect(getBody<TicketListBody>(adminTickets).data.some(item => item.id === ticket.id)).toBe(
      true
    );

    const assigned = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ asignado_a_id: support.body.usuario.id });

    expect(assigned.status).toBe(200);
    expect(getBody<TicketBody>(assigned).data.estado).toBe("En_proceso");

    const proposal = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({
        mensaje: "Revisa el cable de alimentación.",
        es_propuesta_solucion: true,
      });

    expect(proposal.status).toBe(201);

    const internalNote = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ mensaje: "Nota privada", es_nota_interna: true });

    expect(internalNote.status).toBe(201);

    const userMessages = await request(app)
      .get(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const supportMessages = await request(app)
      .get(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${support.body.token}`);

    expect(getBody<MensajeListBody>(userMessages).data).toHaveLength(1);
    expect(getBody<MensajeListBody>(supportMessages).data).toHaveLength(2);

    const approved = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/aprobar`)
      .set("Authorization", `Bearer ${userSession.body.token}`);

    expect(approved.status).toBe(200);
    expect(getBody<TicketBody>(approved).data.estado).toBe("Resuelto");

    const userNotifications = await request(app)
      .get("/api/v1/notificaciones")
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const supportNotifications = await request(app)
      .get("/api/v1/notificaciones")
      .set("Authorization", `Bearer ${support.body.token}`);

    expect(getBody<NotificacionListBody>(userNotifications).data.length).toBeGreaterThanOrEqual(2);
    expect(getBody<NotificacionListBody>(supportNotifications).data.length).toBeGreaterThanOrEqual(
      2
    );
  });

  it("permite rechazar una propuesta y vuelve a En_proceso", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const categoria = getBody<{ data: Array<{ id: string; nombre: string }> }>(
      categorias
    ).data.find(item => item.nombre === "Software");

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "Error al abrir el sistema",
        descripcion: "El sistema muestra un error al iniciar.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    const assigned = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ asignado_a_id: support.body.usuario.id });

    expect(assigned.status).toBe(200);

    const proposal = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ mensaje: "Reinicia el servicio.", es_propuesta_solucion: true });

    expect(proposal.status).toBe(201);

    const rejected = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/rechazar`)
      .set("Authorization", `Bearer ${userSession.body.token}`);

    expect(rejected.status).toBe(200);
    expect(getBody<TicketBody>(rejected).data.estado).toBe("En_proceso");
  });

  it("rechaza asignación de Usuario y asignación de Soporte a otro", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const categoria = getBody<{ data: Array<{ id: string; nombre: string }> }>(categorias).data[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "Ticket sin permisos",
        descripcion: "Prueba de permisos.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    const userAssign = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ asignado_a_id: support.body.usuario.id });

    expect(userAssign.status).toBe(403);

    const supportAssignOther = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ asignado_a_id: admin.body.usuario.id });

    expect(supportAssignOther.status).toBe(400);
  });
});
