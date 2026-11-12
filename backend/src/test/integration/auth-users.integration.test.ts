import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  estado: string;
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
  process.env.UPLOADS_DIR = mkdtempSync(join(tmpdir(), "tickets-uploads-"));

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

  it("reactiva un usuario dado de baja y le devuelve el acceso", async () => {
    const admin = await login("admin@example.com", "admin123");
    const roles = await getRoles(admin.body.token);
    const userRole = roles.body.data.find(role => role.nombre === "Usuario");
    const correo = `reactivacion-${Date.now()}@example.com`;

    const created = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({
        nombre: "Reactivación",
        apellido_paterno: "Prueba",
        apellido_materno: "Sistema",
        correo_electronico: correo,
        rol_id: userRole?.id,
      });

    const credenciales = getBody<CreateUserBody>(created).data;

    expect(created.status).toBe(201);

    const baja = await request(app)
      .delete(`/api/v1/users/${credenciales.user.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(baja.status).toBe(200);
    expect((await login(correo, credenciales.contrasena)).response.status).toBe(403);

    const edicionBloqueada = await request(app)
      .patch(`/api/v1/users/${credenciales.user.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre: "No debería aplicarse" });

    expect(edicionBloqueada.status).toBe(400);

    const reactivado = await request(app)
      .patch(`/api/v1/users/${credenciales.user.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ estado: "Activo" });

    expect(reactivado.status).toBe(200);
    expect(getBody<UpdateUserBody>(reactivado).data.estado).toBe("Activo");
    expect((await login(correo, credenciales.contrasena)).response.status).toBe(200);
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

  it("filtra áreas activas con el parámetro activo", async () => {
    const admin = await login("admin@example.com", "admin123");
    const nombre = `Área filtro ${Date.now()}`;

    const created = await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre });

    const area = getBody<AreaBody>(created).data;

    await request(app)
      .patch(`/api/v1/areas/${area.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ activo: false });

    const activas = await request(app)
      .get("/api/v1/areas?activo=true")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const todas = await request(app)
      .get("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const invalido = await request(app)
      .get("/api/v1/areas?activo=quizas")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(getBody<AreaListBody>(activas).data.some(item => item.id === area.id)).toBe(false);
    expect(getBody<AreaListBody>(todas).data.some(item => item.id === area.id)).toBe(true);
    expect(invalido.status).toBe(400);
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
  asunto: string;
  prioridad: string;
  estado: string;
  asignado_a: { id: string } | null;
  usuario_creador: { id: string };
  fecha_cierre: string | null;
}

interface TicketBody {
  data: TicketDto;
}

interface TicketListBody {
  data: TicketDto[];
}

interface TicketPageBody {
  data: TicketDto[];
  meta: {
    pagina: number;
    limite: number;
    total: number;
    total_paginas: number;
  };
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
  mensaje: string;
  leida: boolean;
}

interface NotificacionListBody {
  data: NotificacionDto[];
}

interface HistorialDto {
  tipo_evento: string;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  detalle: string | null;
}

interface HistorialListBody {
  data: HistorialDto[];
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
    expect(getBody<TicketBody>(approved).data).toMatchObject({
      estado: "Cerrado",
    });
    expect(getBody<TicketBody>(approved).data.fecha_cierre).not.toBeNull();

    const mensajeTrasCierre = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ mensaje: "<p>Mensaje fuera de tiempo</p>" });

    expect(mensajeTrasCierre.status).toBe(400);

    const userNotifications = await request(app)
      .get("/api/v1/notificaciones")
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const supportNotifications = await request(app)
      .get("/api/v1/notificaciones")
      .set("Authorization", `Bearer ${support.body.token}`);

    // Crear ya no notifica: el creador recibe la propuesta y el Soporte la aprobación.
    expect(getBody<NotificacionListBody>(userNotifications).data.length).toBeGreaterThanOrEqual(1);
    expect(getBody<NotificacionListBody>(supportNotifications).data.length).toBeGreaterThanOrEqual(
      1
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

  it("permite al Administrador cerrar un ticket y registra historial y notificación", async () => {
    const admin = await login("admin@example.com", "admin123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const categoria = getBody<CategoriaListBody>(categorias).data[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "Ticket para cierre",
        descripcion: "Se cerrará por el Administrador.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    const closed = await request(app)
      .patch(`/api/v1/tickets/${ticket.id}/estado`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ estado: "Cerrado" });

    const cerrado = getBody<TicketBody>(closed).data;

    expect(closed.status).toBe(200);
    expect(cerrado.estado).toBe("Cerrado");
    expect(cerrado.fecha_cierre).not.toBeNull();

    const historial = await request(app)
      .get(`/api/v1/tickets/${ticket.id}/historial`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(getBody<HistorialListBody>(historial).data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tipo_evento: "CAMBIO_ESTADO",
          estado_anterior: "Abierto",
          estado_nuevo: "Cerrado",
        }),
      ])
    );

    const notificaciones = await request(app)
      .get("/api/v1/notificaciones")
      .set("Authorization", `Bearer ${userSession.body.token}`);

    expect(getBody<NotificacionListBody>(notificaciones).data).toEqual(
      expect.arrayContaining([expect.objectContaining({ mensaje: "Tu ticket fue cerrado" })])
    );
  });

  it("permite al Soporte asignado cerrar su ticket", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const categoria = getBody<CategoriaListBody>(categorias).data[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "Cierre por Soporte",
        descripcion: "Ticket asignado que se cierra.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ asignado_a_id: support.body.usuario.id });

    const closed = await request(app)
      .patch(`/api/v1/tickets/${ticket.id}/estado`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ estado: "Cerrado" });

    expect(closed.status).toBe(200);
    expect(getBody<TicketBody>(closed).data.estado).toBe("Cerrado");
  });

  it("rechaza el cierre a Soporte no asignado y al Usuario creador", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const categoria = getBody<CategoriaListBody>(categorias).data[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "Cierre sin permisos",
        descripcion: "Nadie asignado todavía.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    const supportClose = await request(app)
      .patch(`/api/v1/tickets/${ticket.id}/estado`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ estado: "Cerrado" });

    const userClose = await request(app)
      .patch(`/api/v1/tickets/${ticket.id}/estado`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ estado: "Cerrado" });

    expect(supportClose.status).toBe(403);
    expect(userClose.status).toBe(403);
  });

  it("rechaza transiciones que tienen su propio endpoint", async () => {
    const admin = await login("admin@example.com", "admin123");
    const support = await login("soporte@example.com", "soporte123");
    const userSession = await login("usuario@example.com", "usuario123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const categoria = getBody<CategoriaListBody>(categorias).data[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: "Transición inválida",
        descripcion: "No se puede proponer por esta ruta.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ asignado_a_id: support.body.usuario.id });

    const response = await request(app)
      .patch(`/api/v1/tickets/${ticket.id}/estado`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ estado: "En_revision" });

    expect(response.status).toBe(400);
  });
});

describe("API tickets: edición", () => {
  it("permite al Administrador editar asunto, prioridad, categoría y área", async () => {
    const admin = await login("admin@example.com", "admin123");
    const creador = await login("usuario@example.com", "usuario123");
    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const areas = await request(app)
      .get("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const listaCategorias = getBody<CategoriaListBody>(categorias).data;
    const listaAreas = getBody<AreaListBody>(areas).data;
    const categoria = listaCategorias[0];
    const area = listaAreas[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${creador.body.token}`)
      .send({
        asunto: "Asunto original de edición",
        descripcion: "Ticket para probar la edición.",
        categoria_id: categoria?.id,
      });
    const ticket = getBody<TicketBody>(created).data;

    const editado = await request(app)
      .patch(`/api/v1/tickets/${ticket.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({
        asunto: "Asunto corregido",
        prioridad: "Alta",
        categoria_id: listaCategorias[1]?.id,
        area_id: area?.id,
      });

    expect(editado.status).toBe(200);
    expect(getBody<TicketBody>(editado).data.asunto).toBe("Asunto corregido");
    expect(getBody<TicketBody>(editado).data.prioridad).toBe("Alta");

    const detalle = await request(app)
      .get(`/api/v1/tickets/${ticket.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(detalle.status).toBe(200);
    expect(getBody<TicketBody>(detalle).data.asunto).toBe("Asunto corregido");
    expect(getBody<TicketBody>(detalle).data.prioridad).toBe("Alta");

    const historial = await request(app)
      .get(`/api/v1/tickets/${ticket.id}/historial`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(
      getBody<HistorialListBody>(historial).data.some(
        evento => evento.tipo_evento === "CAMBIO_PRIORIDAD"
      )
    ).toBe(true);
  });

  it("rechaza la edición a Soporte y al Usuario creador", async () => {
    const soporte = await login("soporte@example.com", "soporte123");
    const creador = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(creador.body.token);

    const delSoporte = await request(app)
      .patch(`/api/v1/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${soporte.body.token}`)
      .send({ asunto: "Cambio no autorizado" });
    const delCreador = await request(app)
      .patch(`/api/v1/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${creador.body.token}`)
      .send({ asunto: "Cambio no autorizado" });

    expect(delSoporte.status).toBe(403);
    expect(delCreador.status).toBe(403);
  });
});

describe("API tickets: filtros y paginación", () => {
  const crearTicket = (
    token: string,
    categoria_id: string,
    datos: { asunto: string; prioridad?: string; area_id?: string }
  ) =>
    request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({ descripcion: `Descripción de ${datos.asunto}`, categoria_id, ...datos });

  const getCategoria = async (token: string) => {
    const response = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${token}`);

    return getBody<CategoriaListBody>(response).data[0];
  };

  it("pagina los tickets y devuelve meta", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const categoria = await getCategoria(userSession.body.token);
    const marca = `Paginacion${Date.now()}`;

    for (let i = 1; i <= 12; i += 1) {
      const created = await crearTicket(userSession.body.token, categoria?.id ?? "", {
        asunto: `${marca} ${i}`,
      });

      expect(created.status).toBe(201);
    }

    const page3 = await request(app)
      .get(`/api/v1/tickets?buscar=${marca}&limite=5&pagina=3`)
      .set("Authorization", `Bearer ${userSession.body.token}`);

    const body = getBody<TicketPageBody>(page3);

    expect(page3.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta).toEqual({ pagina: 3, limite: 5, total: 12, total_paginas: 3 });

    const beyond = await request(app)
      .get(`/api/v1/tickets?buscar=${marca}&limite=5&pagina=9`)
      .set("Authorization", `Bearer ${userSession.body.token}`);

    expect(getBody<TicketPageBody>(beyond).data).toHaveLength(0);
  });

  it("filtra por prioridad, estado, categoría, área y código", async () => {
    const admin = await login("admin@example.com", "admin123");
    const userSession = await login("usuario@example.com", "usuario123");
    const categoria = await getCategoria(admin.body.token);
    const areas = await request(app)
      .get("/api/v1/areas?activo=true")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const area = getBody<AreaListBody>(areas).data.find(item => item.nombre === "Sistemas");
    const marca = `Filtros${Date.now()}`;

    const alta = await crearTicket(userSession.body.token, categoria?.id ?? "", {
      asunto: `${marca} alta`,
      prioridad: "Alta",
      area_id: area?.id ?? "",
    });
    await crearTicket(userSession.body.token, categoria?.id ?? "", { asunto: `${marca} dos` });
    await crearTicket(userSession.body.token, categoria?.id ?? "", { asunto: `${marca} tres` });

    const codigo = getBody<TicketBody>(alta).data.codigo;

    const query = async (params: string) => {
      const response = await request(app)
        .get(`/api/v1/tickets?${params}`)
        .set("Authorization", `Bearer ${admin.body.token}`);

      return getBody<TicketPageBody>(response);
    };

    expect((await query(`buscar=${marca}&prioridad=Alta`)).meta.total).toBe(1);
    expect((await query(`buscar=${marca}&estado=Abierto`)).meta.total).toBe(3);
    expect((await query(`buscar=${marca}&estado=Cerrado`)).meta.total).toBe(0);
    expect((await query(`buscar=${marca}&categoria_id=${categoria?.id}`)).meta.total).toBe(3);
    expect((await query(`buscar=${marca}&area_id=${area?.id}`)).meta.total).toBe(1);
    expect((await query(`buscar=${encodeURIComponent(codigo)}`)).meta.total).toBe(1);
  });

  it("no rompe el aislamiento del Usuario al filtrar", async () => {
    const admin = await login("admin@example.com", "admin123");
    const userSession = await login("usuario@example.com", "usuario123");
    const categoria = await getCategoria(admin.body.token);
    const marca = `Aislamiento${Date.now()}`;

    await crearTicket(admin.body.token, categoria?.id ?? "", { asunto: `${marca} admin` });
    await crearTicket(userSession.body.token, categoria?.id ?? "", { asunto: `${marca} usuario` });

    const asUser = await request(app)
      .get(`/api/v1/tickets?buscar=${marca}`)
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const asAdmin = await request(app)
      .get(`/api/v1/tickets?buscar=${marca}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    const userBody = getBody<TicketPageBody>(asUser);

    expect(userBody.meta.total).toBe(1);
    expect(userBody.data[0]?.usuario_creador.id).toBe(userSession.body.usuario.id);
    expect(getBody<TicketPageBody>(asAdmin).meta.total).toBe(2);
  });

  it("rechaza parámetros de consulta inválidos", async () => {
    const admin = await login("admin@example.com", "admin123");

    for (const query of [
      "pagina=0",
      "limite=500",
      "estado=Inventado",
      "prioridad=Urgente",
      "buscar=",
      "categoria_id=no-es-uuid",
    ]) {
      const response = await request(app)
        .get(`/api/v1/tickets?${query}`)
        .set("Authorization", `Bearer ${admin.body.token}`);

      expect(response.status).toBe(400);
    }
  });
});

interface AdjuntoDto {
  id: string;
  nombre_original: string;
  tipo_mime: string | null;
  ruta_url: string;
}

interface AdjuntoBody {
  data: AdjuntoDto;
}

interface ErrorBody {
  error: string;
}

interface MensajeConAdjuntosDto extends MensajeDto {
  mensaje: string;
  adjuntos: AdjuntoDto[];
}

interface MensajeConAdjuntosBody {
  data: MensajeConAdjuntosDto;
}

describe("API tickets: Soporte debe tomar antes de responder", () => {
  it("rechaza mensajes sin asignación y los permite después", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const support = await login("soporte@example.com", "soporte123");

    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${userSession.body.token}`);
    const categoria = getBody<CategoriaListBody>(categorias).data[0];

    const created = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        asunto: `Soporte sin tomar ${Date.now()}`,
        descripcion: "Ticket para probar la regla de mensajes.",
        categoria_id: categoria?.id,
      });

    const ticket = getBody<TicketBody>(created).data;

    const sinAsignar = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ mensaje: "<p>Mensaje sin tomar</p>" });

    expect(sinAsignar.status).toBe(403);

    const asignado = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/asignar`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ asignado_a_id: support.body.usuario.id });

    expect(asignado.status).toBe(200);

    const despues = await request(app)
      .post(`/api/v1/tickets/${ticket.id}/mensajes`)
      .set("Authorization", `Bearer ${support.body.token}`)
      .send({ mensaje: "<p>Mensaje con el ticket tomado</p>" });

    expect(despues.status).toBe(201);
  });
});

const crearTicket = async (token: string) => {
  const categorias = await request(app)
    .get("/api/v1/categorias")
    .set("Authorization", `Bearer ${token}`);
  const categoria = getBody<CategoriaListBody>(categorias).data[0];

  const created = await request(app)
    .post("/api/v1/tickets")
    .set("Authorization", `Bearer ${token}`)
    .send({
      asunto: `Adjuntos ${Date.now()}`,
      descripcion: "Ticket para probar adjuntos.",
      categoria_id: categoria?.id,
    });

  return getBody<TicketBody>(created).data.id;
};

const crearOtroUsuario = async (rol: "Usuario" | "Soporte" = "Usuario") => {
  const admin = await login("admin@example.com", "admin123");
  const roles = await request(app)
    .get("/api/v1/roles")
    .set("Authorization", `Bearer ${admin.body.token}`);
  const rolEncontrado = getBody<RolesBody>(roles).data.find(role => role.nombre === rol);
  const sufijo = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const correo = `${rol.toLowerCase()}-${sufijo}@example.com`;

  const created = await request(app)
    .post("/api/v1/users")
    .set("Authorization", `Bearer ${admin.body.token}`)
    .send({
      nombre: "Otro",
      apellido_paterno: rol,
      apellido_materno: "Prueba",
      correo_electronico: correo,
      rol_id: rolEncontrado?.id,
    });

  const credenciales = getBody<CreateUserBody>(created).data;

  return login(credenciales.correo_electronico, credenciales.contrasena);
};

describe("API adjuntos", () => {
  it("sube, entrega y enlaza una imagen al mensaje", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.from([0xff, 0xd8, 0xff, 0xe0]), {
        filename: "foto.jpg",
        contentType: "image/jpeg",
      });

    const adjunto = getBody<AdjuntoBody>(subida).data;

    expect(subida.status).toBe(201);
    expect(adjunto.ruta_url).toBe(`/api/v1/adjuntos/${adjunto.id}`);

    const descarga = await request(app)
      .get(`/api/v1/adjuntos/${adjunto.id}`)
      .set("Authorization", `Bearer ${userSession.body.token}`);

    expect(descarga.status).toBe(200);
    expect(descarga.headers["content-type"]).toContain("image/jpeg");

    const mensaje = await request(app)
      .post(`/api/v1/tickets/${ticketId}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({
        mensaje: "<p>Con <strong>foto</strong> adjunta</p>",
        adjunto_ids: [adjunto.id],
      });

    const mensajeCreado = getBody<MensajeConAdjuntosBody>(mensaje).data;

    expect(mensaje.status).toBe(201);
    expect(mensajeCreado.mensaje).toContain("<strong>foto</strong>");
    expect(mensajeCreado.adjuntos).toHaveLength(1);
  });

  it("rechaza el acceso de otro usuario al adjunto", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const otro = await crearOtroUsuario();
    const ticketId = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: "captura.png",
        contentType: "image/png",
      });

    const adjunto = getBody<AdjuntoBody>(subida).data;

    const descarga = await request(app)
      .get(`/api/v1/adjuntos/${adjunto.id}`)
      .set("Authorization", `Bearer ${otro.body.token}`);

    expect(descarga.status).toBe(403);
  });

  it("rechaza archivos que no son imagen", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.from("texto plano"), {
        filename: "nota.txt",
        contentType: "text/plain",
      });

    expect(subida.status).toBe(400);
  });
  it("rechaza la descarga sin sesión", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: "captura.png",
        contentType: "image/png",
      });

    const adjunto = getBody<AdjuntoBody>(subida).data;

    const descarga = await request(app).get(`/api/v1/adjuntos/${adjunto.id}`);

    expect(descarga.status).toBe(401);
  });

  it("rechaza imágenes de más de 5 MB", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "enorme.png",
        contentType: "image/png",
      });

    expect(subida.status).toBe(400);
    expect(getBody<ErrorBody>(subida).error).toContain("5 MB");
  });

  it("rechaza más de cinco adjuntos por mensaje", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(userSession.body.token);
    const adjuntoIds = Array.from({ length: 6 }, () => randomUUID());

    const mensaje = await request(app)
      .post(`/api/v1/tickets/${ticketId}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ mensaje: "<p>Demasiadas imágenes</p>", adjunto_ids: adjuntoIds });

    expect(mensaje.status).toBe(400);
  });

  it("rechaza un adjunto que pertenece a otro ticket", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketConAdjunto = await crearTicket(userSession.body.token);
    const otroTicket = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketConAdjunto}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: "captura.png",
        contentType: "image/png",
      });

    const adjunto = getBody<AdjuntoBody>(subida).data;

    const mensaje = await request(app)
      .post(`/api/v1/tickets/${otroTicket}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ mensaje: "<p>Adjunto de otro ticket</p>", adjunto_ids: [adjunto.id] });

    expect(mensaje.status).toBe(400);
  });

  it("no permite enlazar dos veces el mismo adjunto", async () => {
    const userSession = await login("usuario@example.com", "usuario123");
    const ticketId = await crearTicket(userSession.body.token);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .attach("archivo", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: "captura.png",
        contentType: "image/png",
      });

    const adjunto = getBody<AdjuntoBody>(subida).data;

    const primero = await request(app)
      .post(`/api/v1/tickets/${ticketId}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ mensaje: "<p>Primero</p>", adjunto_ids: [adjunto.id] });

    expect(primero.status).toBe(201);

    const segundo = await request(app)
      .post(`/api/v1/tickets/${ticketId}/mensajes`)
      .set("Authorization", `Bearer ${userSession.body.token}`)
      .send({ mensaje: "<p>Segundo</p>", adjunto_ids: [adjunto.id] });

    expect(segundo.status).toBe(400);
  });
});

interface NotificacionDto {
  id: string;
  ticket_id: string | null;
  mensaje: string;
  leida: boolean;
  ticket: { id: string; codigo: string; asunto: string; estado: string } | null;
}

interface NotificacionesBody {
  data: NotificacionDto[];
  meta: { total: number; no_leidas: number };
}

describe("API notificaciones", () => {
  const leer = async (token: string, consulta = "") =>
    getBody<NotificacionesBody>(
      await request(app)
        .get(`/api/v1/notificaciones${consulta}`)
        .set("Authorization", `Bearer ${token}`)
    );

  const crearConversacion = async () => {
    const creador = await crearOtroUsuario();
    const soporte = await crearOtroUsuario("Soporte");
    const ticketId = await crearTicket(creador.body.token);

    await request(app)
      .post(`/api/v1/tickets/${ticketId}/asignar`)
      .set("Authorization", `Bearer ${soporte.body.token}`)
      .send({ asignado_a_id: soporte.body.usuario.id });

    const responder = (token: string, mensaje: string) =>
      request(app)
        .post(`/api/v1/tickets/${ticketId}/mensajes`)
        .set("Authorization", `Bearer ${token}`)
        .send({ mensaje });

    return { creador, soporte, ticketId, responder };
  };

  it("avisa al creador cuando Soporte responde", async () => {
    const { creador, soporte, ticketId, responder } = await crearConversacion();

    expect((await leer(creador.body.token)).data).toHaveLength(0);
    expect((await responder(soporte.body.token, "<p>Ya lo reviso</p>")).status).toBe(201);

    const cuerpo = await leer(creador.body.token);

    expect(cuerpo.data).toHaveLength(1);
    expect(cuerpo.data[0]).toMatchObject({
      ticket_id: ticketId,
      leida: false,
      ticket: { id: ticketId, codigo: expect.stringContaining("#TK-") as string },
    });
    expect(cuerpo.data[0]?.mensaje).toContain("Nuevo mensaje de");
    expect(cuerpo.meta).toEqual({ total: 1, no_leidas: 1 });
  });

  it("avisa al Soporte cuando responde el creador", async () => {
    const { creador, soporte, responder } = await crearConversacion();

    expect((await leer(soporte.body.token)).data).toHaveLength(0);
    expect((await responder(creador.body.token, "<p>Sigue fallando</p>")).status).toBe(201);

    const cuerpo = await leer(soporte.body.token);

    expect(cuerpo.data).toHaveLength(1);
    expect(cuerpo.data[0]?.mensaje).toContain("Nuevo mensaje de");
  });

  it("no avisa al Soporte que toma el ticket", async () => {
    const soporte = await crearOtroUsuario("Soporte");
    const creador = await crearOtroUsuario();
    const ticketId = await crearTicket(creador.body.token);

    const asignado = await request(app)
      .post(`/api/v1/tickets/${ticketId}/asignar`)
      .set("Authorization", `Bearer ${soporte.body.token}`)
      .send({ asignado_a_id: soporte.body.usuario.id });

    expect(asignado.status).toBe(200);
    expect((await leer(soporte.body.token)).data).toHaveLength(0);
  });

  it("filtra las no leídas y marca una como leída", async () => {
    const { creador, soporte, responder } = await crearConversacion();
    await responder(soporte.body.token, "<p>Primera respuesta</p>");

    const pendientes = await leer(creador.body.token, "?no_leidas=true");
    const notificacion = pendientes.data[0];

    expect(notificacion).toBeDefined();

    const marcada = await request(app)
      .patch(`/api/v1/notificaciones/${notificacion?.id}/leida`)
      .set("Authorization", `Bearer ${creador.body.token}`);

    expect(marcada.status).toBe(200);

    const despues = await leer(creador.body.token, "?no_leidas=true");

    expect(despues.data).toHaveLength(0);
    expect(despues.meta.no_leidas).toBe(0);
  });

  it("marca todas las notificaciones como leídas", async () => {
    const { creador, soporte, responder } = await crearConversacion();

    await responder(soporte.body.token, "<p>Uno</p>");
    await responder(soporte.body.token, "<p>Dos</p>");

    expect((await leer(creador.body.token)).meta).toEqual({ total: 2, no_leidas: 2 });

    const respuesta = await request(app)
      .patch("/api/v1/notificaciones/leidas")
      .set("Authorization", `Bearer ${creador.body.token}`);

    expect(respuesta.status).toBe(200);
    expect(getBody<{ data: { actualizadas: number } }>(respuesta).data.actualizadas).toBe(2);
    expect((await leer(creador.body.token)).meta).toEqual({ total: 2, no_leidas: 0 });
  });

  it("rechaza la consulta sin sesión", async () => {
    const respuesta = await request(app).get("/api/v1/notificaciones");

    expect(respuesta.status).toBe(401);
  });
});

describe("API tickets cerrados", () => {
  const cerrarTicket = async (token: string, ticketId: string) =>
    request(app)
      .patch(`/api/v1/tickets/${ticketId}/estado`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: "Cerrado" });

  it("rechaza mensajes de ambos lados cuando el ticket está cerrado", async () => {
    const creador = await crearOtroUsuario();
    const soporte = await crearOtroUsuario("Soporte");
    const admin = await login("admin@example.com", "admin123");
    const ticketId = await crearTicket(creador.body.token);

    await request(app)
      .post(`/api/v1/tickets/${ticketId}/asignar`)
      .set("Authorization", `Bearer ${soporte.body.token}`)
      .send({ asignado_a_id: soporte.body.usuario.id });

    expect((await cerrarTicket(admin.body.token, ticketId)).status).toBe(200);

    const delCreador = await request(app)
      .post(`/api/v1/tickets/${ticketId}/mensajes`)
      .set("Authorization", `Bearer ${creador.body.token}`)
      .send({ mensaje: "<p>Mensaje tardío</p>" });

    const delSoporte = await request(app)
      .post(`/api/v1/tickets/${ticketId}/mensajes`)
      .set("Authorization", `Bearer ${soporte.body.token}`)
      .send({ mensaje: "<p>Mensaje tardío</p>" });

    expect(delCreador.status).toBe(400);
    expect(delSoporte.status).toBe(400);
  });

  it("rechaza adjuntos en un ticket cerrado", async () => {
    const creador = await crearOtroUsuario();
    const admin = await login("admin@example.com", "admin123");
    const ticketId = await crearTicket(creador.body.token);

    expect((await cerrarTicket(admin.body.token, ticketId)).status).toBe(200);

    const subida = await request(app)
      .post(`/api/v1/tickets/${ticketId}/adjuntos`)
      .set("Authorization", `Bearer ${creador.body.token}`)
      .attach("archivo", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: "tarde.png",
        contentType: "image/png",
      });

    expect(subida.status).toBe(400);
  });
});

interface DashboardBody {
  data: {
    tickets: { activos: number; cerrados: number; resueltos: number; total: number };
    usuarios: { registrados: number; activos: number; inactivos: number };
  };
}

describe("API analíticas", () => {
  it("devuelve el dashboard al Administrador y al Soporte", async () => {
    const admin = await login("admin@example.com", "admin123");
    const soporte = await login("soporte@example.com", "soporte123");

    const delAdmin = await request(app)
      .get("/api/v1/analiticas/dashboard")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const delSoporte = await request(app)
      .get("/api/v1/analiticas/dashboard")
      .set("Authorization", `Bearer ${soporte.body.token}`);

    expect(delAdmin.status).toBe(200);
    expect(delSoporte.status).toBe(200);

    const dashboard = getBody<DashboardBody>(delAdmin).data;

    expect(dashboard.tickets.total).toBeGreaterThan(0);
    expect(dashboard.usuarios.registrados).toBeGreaterThan(0);
    expect(dashboard.tickets.activos + dashboard.tickets.cerrados).toBeLessThanOrEqual(
      dashboard.tickets.total
    );
    expect(dashboard.usuarios.activos + dashboard.usuarios.inactivos).toBe(
      dashboard.usuarios.registrados
    );
  });

  it("rechaza el dashboard al Usuario y sin sesión", async () => {
    const usuario = await login("usuario@example.com", "usuario123");

    const delUsuario = await request(app)
      .get("/api/v1/analiticas/dashboard")
      .set("Authorization", `Bearer ${usuario.body.token}`);
    const sinSesion = await request(app).get("/api/v1/analiticas/dashboard");

    expect(delUsuario.status).toBe(403);
    expect(sinSesion.status).toBe(401);
  });
});

describe("API salud", () => {
  it("responde sin sesión", async () => {
    const respuesta = await request(app).get("/api/v1/salud");

    expect(respuesta.status).toBe(200);
    expect(getBody<{ estado: string }>(respuesta).estado).toBe("ok");
  });
});

describe("API catálogos: borrado y estado", () => {
  const sufijo = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  it("elimina un área sin tickets", async () => {
    const admin = await login("admin@example.com", "admin123");
    const nombre = `Temporal ${sufijo()}`;

    const creada = await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre });

    const area = getBody<AreaBody>(creada).data;

    expect(creada.status).toBe(201);

    const eliminada = await request(app)
      .delete(`/api/v1/areas/${area.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(eliminada.status).toBe(200);

    const listado = await request(app)
      .get("/api/v1/areas?activo=all")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(getBody<AreaListBody>(listado).data.some(item => item.id === area.id)).toBe(false);
  });

  it("rechaza eliminar un área con tickets", async () => {
    const admin = await login("admin@example.com", "admin123");
    const usuario = await login("usuario@example.com", "usuario123");
    const nombre = `En uso ${sufijo()}`;

    const creada = await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre });

    const area = getBody<AreaBody>(creada).data;
    const categorias = await request(app)
      .get("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`);
    const categoria = getBody<CategoriaListBody>(categorias).data[0];

    const ticket = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${usuario.body.token}`)
      .send({
        asunto: `Área en uso ${sufijo()}`,
        descripcion: "Ticket para probar el borrado de un área en uso.",
        categoria_id: categoria?.id,
        area_id: area.id,
      });

    expect(ticket.status).toBe(201);

    const eliminada = await request(app)
      .delete(`/api/v1/areas/${area.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(eliminada.status).toBe(400);
  });

  it("crea, desactiva y elimina una categoría", async () => {
    const admin = await login("admin@example.com", "admin123");
    const nombre = `Categoría ${sufijo()}`;

    const creada = await request(app)
      .post("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre, descripcion: "Temporal" });

    const categoria = getBody<{ data: { id: string; activo: boolean } }>(creada).data;

    expect(creada.status).toBe(201);
    expect(categoria.activo).toBe(true);

    await request(app)
      .patch(`/api/v1/categorias/${categoria.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ activo: false });

    const activas = await request(app)
      .get("/api/v1/categorias?activo=true")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(getBody<CategoriaListBody>(activas).data.some(item => item.id === categoria.id)).toBe(
      false
    );

    const eliminada = await request(app)
      .delete(`/api/v1/categorias/${categoria.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(eliminada.status).toBe(200);
  });

  it("rechaza un ticket con categoría inactiva", async () => {
    const admin = await login("admin@example.com", "admin123");
    const usuario = await login("usuario@example.com", "usuario123");

    const creada = await request(app)
      .post("/api/v1/categorias")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre: `Inactiva ${sufijo()}` });

    const categoria = getBody<{ data: { id: string } }>(creada).data;

    await request(app)
      .patch(`/api/v1/categorias/${categoria.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ activo: false });

    const ticket = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${usuario.body.token}`)
      .send({
        asunto: "Categoría inactiva",
        descripcion: "No debería crearse.",
        categoria_id: categoria.id,
      });

    expect(ticket.status).toBe(400);

    await request(app)
      .delete(`/api/v1/categorias/${categoria.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);
  });
});

describe("API contraseñas", () => {
  it("permite cambiar la contraseña propia y restablecerla como administrador", async () => {
    const admin = await login("admin@example.com", "admin123");
    const roles = await getRoles(admin.body.token);
    const rolUsuario = roles.body.data.find(role => role.nombre === "Usuario");
    const correo = `contrasena-${Date.now()}@example.com`;

    const creado = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({
        nombre: "Contraseña",
        apellido_paterno: "Prueba",
        apellido_materno: "Sistema",
        correo_electronico: correo,
        rol_id: rolUsuario?.id,
      });

    const inicial = getBody<CreateUserBody>(creado).data;

    expect(creado.status).toBe(201);

    const sesion = await login(correo, inicial.contrasena);

    expect(sesion.response.status).toBe(200);

    const cambio = await request(app)
      .patch("/api/v1/autenticacion/contrasena")
      .set("Authorization", `Bearer ${sesion.body.token}`)
      .send({ actual: inicial.contrasena, nueva: "nuevaClave123" });

    expect(cambio.status).toBe(200);
    expect((await login(correo, "nuevaClave123")).response.status).toBe(200);
    expect((await login(correo, inicial.contrasena)).response.status).toBe(401);

    const restablecida = await request(app)
      .post(`/api/v1/users/${inicial.user.id}/contrasena`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    const nueva = getBody<{ data: { contrasena: string } }>(restablecida).data;

    expect(restablecida.status).toBe(200);
    expect((await login(correo, nueva.contrasena)).response.status).toBe(200);
    expect((await login(correo, "nuevaClave123")).response.status).toBe(401);
  });

  it("rechaza el cambio con la contraseña actual incorrecta", async () => {
    const usuario = await login("usuario@example.com", "usuario123");

    const cambio = await request(app)
      .patch("/api/v1/autenticacion/contrasena")
      .set("Authorization", `Bearer ${usuario.body.token}`)
      .send({ actual: "incorrecta", nueva: "otraClave123" });

    expect(cambio.status).toBe(400);
  });

  it("rechaza restablecer la contraseña a un usuario dado de baja", async () => {
    const admin = await login("admin@example.com", "admin123");
    const roles = await getRoles(admin.body.token);
    const rolUsuario = roles.body.data.find(role => role.nombre === "Usuario");
    const correo = `baja-clave-${Date.now()}@example.com`;

    const creado = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({
        nombre: "Baja",
        apellido_paterno: "Contraseña",
        apellido_materno: "Prueba",
        correo_electronico: correo,
        rol_id: rolUsuario?.id,
      });

    const usuario = getBody<CreateUserBody>(creado).data;

    await request(app)
      .delete(`/api/v1/users/${usuario.user.id}`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    const restablecida = await request(app)
      .post(`/api/v1/users/${usuario.user.id}/contrasena`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(restablecida.status).toBe(400);
  });
});

describe("API reapertura de tickets", () => {
  it("reabre un ticket cerrado y vuelve a Abierto si no tiene Soporte", async () => {
    const admin = await login("admin@example.com", "admin123");
    const creador = await crearOtroUsuario();
    const ticketId = await crearTicket(creador.body.token);

    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/estado`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ estado: "Cerrado" });

    const reabierto = await request(app)
      .post(`/api/v1/tickets/${ticketId}/reabrir`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(reabierto.status).toBe(200);
    expect(getBody<TicketBody>(reabierto).data.estado).toBe("Abierto");
    expect(getBody<TicketBody>(reabierto).data.fecha_cierre).toBeNull();

    const historial = await request(app)
      .get(`/api/v1/tickets/${ticketId}/historial`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(
      getBody<HistorialListBody>(historial).data.some(
        evento => evento.detalle === "Ticket reabierto"
      )
    ).toBe(true);
  });

  it("reabre a En_proceso cuando el ticket tiene Soporte asignado", async () => {
    const admin = await login("admin@example.com", "admin123");
    const soporte = await crearOtroUsuario("Soporte");
    const creador = await crearOtroUsuario();
    const ticketId = await crearTicket(creador.body.token);

    await request(app)
      .post(`/api/v1/tickets/${ticketId}/asignar`)
      .set("Authorization", `Bearer ${soporte.body.token}`)
      .send({ asignado_a_id: soporte.body.usuario.id });

    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/estado`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ estado: "Cerrado" });

    const reabierto = await request(app)
      .post(`/api/v1/tickets/${ticketId}/reabrir`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(reabierto.status).toBe(200);
    expect(getBody<TicketBody>(reabierto).data.estado).toBe("En_proceso");
  });

  it("rechaza reabrir a quien no es administrador y un ticket abierto", async () => {
    const admin = await login("admin@example.com", "admin123");
    const creador = await crearOtroUsuario();
    const ticketId = await crearTicket(creador.body.token);

    const abierto = await request(app)
      .post(`/api/v1/tickets/${ticketId}/reabrir`)
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(abierto.status).toBe(400);

    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/estado`)
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ estado: "Cerrado" });

    const delCreador = await request(app)
      .post(`/api/v1/tickets/${ticketId}/reabrir`)
      .set("Authorization", `Bearer ${creador.body.token}`);

    expect(delCreador.status).toBe(403);
  });
});

describe("API auditoría", () => {
  it("registra acciones administrativas y las devuelve al Administrador", async () => {
    const admin = await login("admin@example.com", "admin123");
    const nombre = `Auditada ${Date.now()}`;

    await request(app)
      .post("/api/v1/areas")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ nombre });

    const auditoria = await request(app)
      .get("/api/v1/auditoria?entidad=AREA&limite=100")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(auditoria.status).toBe(200);

    const cuerpo = getBody<{
      data: Array<{ accion: string; entidad: string; detalle: string | null }>;
      meta: { total: number };
    }>(auditoria);

    expect(cuerpo.meta.total).toBeGreaterThan(0);
    expect(
      cuerpo.data.some(registro => registro.accion === "CREAR" && registro.detalle === nombre)
    ).toBe(true);
  });

  it("rechaza la auditoría a otros roles", async () => {
    const soporte = await login("soporte@example.com", "soporte123");
    const usuario = await login("usuario@example.com", "usuario123");

    const delSoporte = await request(app)
      .get("/api/v1/auditoria")
      .set("Authorization", `Bearer ${soporte.body.token}`);
    const delUsuario = await request(app)
      .get("/api/v1/auditoria")
      .set("Authorization", `Bearer ${usuario.body.token}`);

    expect(delSoporte.status).toBe(403);
    expect(delUsuario.status).toBe(403);
  });
});

describe("API usuarios: paginación y búsqueda", () => {
  it("pagina y devuelve meta", async () => {
    const admin = await login("admin@example.com", "admin123");

    const respuesta = await request(app)
      .get("/api/v1/users?pagina=1&limite=5")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(respuesta.status).toBe(200);

    const cuerpo = getBody<{ data: UserDto[]; meta: { total: number; total_paginas: number } }>(
      respuesta
    );

    expect(cuerpo.data).toHaveLength(5);
    expect(cuerpo.meta.total).toBeGreaterThan(5);
    expect(cuerpo.meta.total_paginas).toBeGreaterThan(1);
  });

  it("busca por correo y filtra por rol", async () => {
    const admin = await login("admin@example.com", "admin123");

    const busqueda = await request(app)
      .get("/api/v1/users?buscar=admin@example.com")
      .set("Authorization", `Bearer ${admin.body.token}`);

    expect(getBody<{ data: UserDto[] }>(busqueda).data).toHaveLength(1);

    const soportes = await request(app)
      .get("/api/v1/users?rol=Soporte&limite=100")
      .set("Authorization", `Bearer ${admin.body.token}`);

    const cuerpo = getBody<{ data: Array<UserDto & { rol: { nombre: string } }> }>(soportes);

    expect(cuerpo.data.length).toBeGreaterThan(0);
    expect(cuerpo.data.every(usuario => usuario.rol.nombre === "Soporte")).toBe(true);
  });

  it("rechaza la paginación a roles sin permiso", async () => {
    const soporte = await login("soporte@example.com", "soporte123");

    const respuesta = await request(app)
      .get("/api/v1/users?pagina=1&limite=5")
      .set("Authorization", `Bearer ${soporte.body.token}`);

    expect(respuesta.status).toBe(403);
  });
});
