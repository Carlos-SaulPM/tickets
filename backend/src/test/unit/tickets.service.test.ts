import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EstadoTicket } from "@/generated/prisma/enums";
import { TicketsService } from "@/modules/tickets/tickets.service";
import type { Ticket, TicketUsuarioResumen } from "@/modules/tickets/tickets.types";
import type { UsuarioAutenticado } from "@/types/autenticacion.types";

const { enviarCorreoMock } = vi.hoisted(() => ({
  enviarCorreoMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/services/correo/correo.service", () => ({
  correoService: { enviarCorreo: enviarCorreoMock },
}));

const creador: TicketUsuarioResumen = {
  id: "11111111-1111-4111-8111-111111111111",
  nombre: "Cliente",
  apellido_paterno: "Prueba",
  correo_electronico: "usuario@example.com",
};

const soporte: TicketUsuarioResumen = {
  id: "22222222-2222-4222-8222-222222222222",
  nombre: "Soporte",
  apellido_paterno: "Prueba",
  correo_electronico: "soporte@example.com",
};

const administrador: UsuarioAutenticado = {
  id: "33333333-3333-4333-8333-333333333333",
  nombre: "Admin",
  correo_electronico: "admin@example.com",
  rol: "Administrador",
};

const usuarioSoporte: UsuarioAutenticado = {
  id: soporte.id,
  nombre: soporte.nombre,
  correo_electronico: soporte.correo_electronico,
  rol: "Soporte",
};

const usuarioCreador: UsuarioAutenticado = {
  id: creador.id,
  nombre: creador.nombre,
  correo_electronico: creador.correo_electronico,
  rol: "Usuario",
};

const buildTicket = (estado: EstadoTicket, asignado: TicketUsuarioResumen | null): Ticket => ({
  id: "44444444-4444-4444-8444-444444444444",
  codigo: "#TK-001",
  asunto: "No enciende",
  descripcion: "La computadora no enciende.",
  prioridad: "Media",
  estado,
  categoria: { id: "55555555-5555-4555-8555-555555555555", nombre: "Hardware" },
  area: null,
  usuario_creador: creador,
  asignado_a: asignado,
  creado_en: new Date("2026-01-01T00:00:00.000Z"),
  actualizado_en: new Date("2026-01-01T00:00:00.000Z"),
  fecha_cierre: null,
});

const createRepositoryMock = () => ({
  listarPaginado: vi.fn(),
  buscarPorId: vi.fn(),
  contar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  updateEstado: vi.fn(),
  asignar: vi.fn(),
  marcarActualizado: vi.fn(),
  buscarCategoriaPorId: vi.fn(),
  buscarAreaPorId: vi.fn(),
  buscarUsuarioPorId: vi.fn(),
  crearMensaje: vi.fn(),
  buscarMensajes: vi.fn(),
  crearHistorial: vi.fn(),
  buscarHistorial: vi.fn(),
  crearNotificacion: vi.fn(),
  buscarNotificaciones: vi.fn(),
  marcarNotificacionLeida: vi.fn(),
  buscarMensajePorId: vi.fn(),
  contarAdjuntosDisponibles: vi.fn(),
  enlazarAdjuntos: vi.fn(),
  contarNotificaciones: vi.fn(),
  marcarTodasLeidas: vi.fn(),
});

describe("TicketsService.cambiarEstado", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: TicketsService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new TicketsService(repository);
  });

  it.each(["Abierto", "En_proceso", "En_revision", "Resuelto"] as const)(
    "permite al Administrador cerrar un ticket en %s",
    async estado => {
      const ticket = buildTicket(estado, soporte);
      const cerrado = {
        ...ticket,
        estado: "Cerrado" as const,
        fecha_cierre: new Date("2026-02-01T00:00:00.000Z"),
      };

      repository.buscarPorId.mockResolvedValue(ticket);
      repository.updateEstado.mockResolvedValue(cerrado);

      const result = await service.cambiarEstado(ticket.id, "Cerrado", administrador);

      expect(result).toEqual(cerrado);
      expect(repository.updateEstado).toHaveBeenCalledWith(ticket.id, "Cerrado", expect.any(Date));
      expect(repository.crearHistorial).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo_evento: "CAMBIO_ESTADO",
          estado_anterior: estado,
          estado_nuevo: "Cerrado",
        })
      );
    }
  );

  it("notifica al creador y al Soporte asignado cuando cierra el Administrador", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.updateEstado.mockResolvedValue({ ...ticket, estado: "Cerrado" });

    await service.cambiarEstado(ticket.id, "Cerrado", administrador);

    const destinatarios = repository.crearNotificacion.mock.calls.map(
      (call: unknown[]) => (call[0] as { usuario_id: string }).usuario_id
    );
    expect(destinatarios).toEqual([creador.id, soporte.id]);
  });

  it("permite al Soporte asignado cerrar su ticket", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.updateEstado.mockResolvedValue({ ...ticket, estado: "Cerrado" });

    const result = await service.cambiarEstado(ticket.id, "Cerrado", usuarioSoporte);

    expect(result.estado).toBe("Cerrado");
    expect(repository.crearHistorial).toHaveBeenCalledOnce();
  });

  it("no notifica al Soporte cuando él mismo cierra el ticket", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.updateEstado.mockResolvedValue({ ...ticket, estado: "Cerrado" });

    await service.cambiarEstado(ticket.id, "Cerrado", usuarioSoporte);

    const destinatarios = repository.crearNotificacion.mock.calls.map(
      (call: unknown[]) => (call[0] as { usuario_id: string }).usuario_id
    );
    expect(destinatarios).toEqual([creador.id]);
  });

  it("rechaza el cierre a un Soporte no asignado", async () => {
    const ticket = buildTicket("En_proceso", null);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(service.cambiarEstado(ticket.id, "Cerrado", usuarioSoporte)).rejects.toMatchObject(
      { status: 403 }
    );

    expect(repository.updateEstado).not.toHaveBeenCalled();
  });

  it("rechaza el cierre al Usuario creador", async () => {
    const ticket = buildTicket("Resuelto", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(service.cambiarEstado(ticket.id, "Cerrado", usuarioCreador)).rejects.toMatchObject(
      { status: 403 }
    );
  });

  it("rechaza cerrar un ticket ya cerrado", async () => {
    const ticket = buildTicket("Cerrado", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(service.cambiarEstado(ticket.id, "Cerrado", administrador)).rejects.toMatchObject({
      status: 400,
    });

    expect(repository.updateEstado).not.toHaveBeenCalled();
  });

  it("rechaza transiciones que tienen su propio endpoint", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(
      service.cambiarEstado(ticket.id, "En_revision", administrador)
    ).rejects.toMatchObject({ status: 400 });

    expect(repository.updateEstado).not.toHaveBeenCalled();
  });

  it("devuelve 404 cuando el ticket no existe", async () => {
    repository.buscarPorId.mockResolvedValue(null);

    await expect(
      service.cambiarEstado("44444444-4444-4444-8444-444444444444", "Cerrado", administrador)
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("TicketsService.getAll", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: TicketsService;

  const areaId = "66666666-6666-4666-8666-666666666666";
  const categoriaId = "55555555-5555-4555-8555-555555555555";

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new TicketsService(repository);
  });

  it("aplica paginación y calcula meta al Administrador", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 42, tickets: [] });

    const result = await service.listar(administrador, { pagina: 3, limite: 10 });

    expect(repository.listarPaginado).toHaveBeenCalledWith({ AND: [{}] }, 20, 10);
    expect(result.meta).toEqual({ pagina: 3, limite: 10, total: 42, total_paginas: 5 });
  });

  it("redondea total_paginas hacia arriba", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 41, tickets: [] });

    const result = await service.listar(administrador, { pagina: 1, limite: 20 });

    expect(result.meta.total_paginas).toBe(3);
  });

  it("devuelve cero páginas cuando no hay tickets", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 0, tickets: [] });

    const result = await service.listar(administrador, { pagina: 1, limite: 20 });

    expect(result.meta).toEqual({ pagina: 1, limite: 20, total: 0, total_paginas: 0 });
  });

  it("limita la visibilidad del Soporte a asignados y sin asignar", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 0, tickets: [] });

    await service.listar(usuarioSoporte, { pagina: 1, limite: 20 });

    expect(repository.listarPaginado).toHaveBeenCalledWith(
      { AND: [{ OR: [{ asignado_a_id: soporte.id }, { asignado_a_id: null }] }] },
      0,
      20
    );
  });

  it("limita la visibilidad del Usuario a sus propios tickets", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 0, tickets: [] });

    await service.listar(usuarioCreador, { pagina: 1, limite: 20 });

    expect(repository.listarPaginado).toHaveBeenCalledWith(
      { AND: [{ usuario_creador_id: creador.id }] },
      0,
      20
    );
  });

  it("combina visibilidad y filtros con AND", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 0, tickets: [] });

    await service.listar(usuarioCreador, {
      estado: "Cerrado",
      prioridad: "Alta",
      area_id: areaId,
      categoria_id: categoriaId,
      buscar: "impresora",
      pagina: 1,
      limite: 20,
    });

    expect(repository.listarPaginado).toHaveBeenCalledWith(
      {
        AND: [
          { usuario_creador_id: creador.id },
          { estado: "Cerrado" },
          { prioridad: "Alta" },
          { area_id: areaId },
          { categoria_id: categoriaId },
          {
            OR: [
              { codigo: { contains: "impresora", mode: "insensitive" } },
              { asunto: { contains: "impresora", mode: "insensitive" } },
              { descripcion: { contains: "impresora", mode: "insensitive" } },
            ],
          },
        ],
      },
      0,
      20
    );
  });

  it("no agrega condiciones cuando no hay filtros", async () => {
    repository.listarPaginado.mockResolvedValue({ total: 0, tickets: [] });

    await service.listar(administrador, { pagina: 1, limite: 20 });

    const [where] = repository.listarPaginado.mock.calls[0] as [unknown, number, number];

    expect(where).toEqual({ AND: [{}] });
  });
});

describe("TicketsService.agregarMensaje", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: TicketsService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new TicketsService(repository);
  });

  it("rechaza al Soporte que no ha tomado el ticket", async () => {
    const ticket = buildTicket("Abierto", null);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(
      service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioSoporte)
    ).rejects.toMatchObject({ status: 403 });

    expect(repository.crearMensaje).not.toHaveBeenCalled();
  });

  it("permite responder al Soporte asignado", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.crearMensaje.mockResolvedValue({ id: "m1", mensaje: "<p>Hola</p>", adjuntos: [] });

    await service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioSoporte);

    expect(repository.crearMensaje).toHaveBeenCalledWith(
      expect.objectContaining({ ticket_id: ticket.id, usuario_id: soporte.id })
    );
    expect(repository.marcarActualizado).toHaveBeenCalledWith(ticket.id);
  });

  it("rechaza mensajes en un ticket cerrado", async () => {
    const ticket = buildTicket("Cerrado", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(
      service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioCreador)
    ).rejects.toMatchObject({ status: 400 });

    expect(repository.crearMensaje).not.toHaveBeenCalled();
  });

  it("rechaza mensajes en un ticket resuelto", async () => {
    const ticket = buildTicket("Resuelto", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);

    await expect(
      service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioSoporte)
    ).rejects.toMatchObject({ status: 400 });

    expect(repository.crearMensaje).not.toHaveBeenCalled();
  });

  it("avisa al creador cuando responde Soporte", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.crearMensaje.mockResolvedValue({ id: "m1", mensaje: "<p>Hola</p>", adjuntos: [] });

    await service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioSoporte);

    expect(repository.crearNotificacion).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: creador.id,
        ticket_id: ticket.id,
        mensaje: `Nuevo mensaje de ${soporte.nombre}`,
      })
    );
  });

  it("avisa al Soporte asignado cuando responde el creador", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.crearMensaje.mockResolvedValue({ id: "m1", mensaje: "<p>Hola</p>", adjuntos: [] });

    await service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioCreador);

    expect(repository.crearNotificacion).toHaveBeenCalledWith(
      expect.objectContaining({ usuario_id: soporte.id })
    );
  });

  it("no avisa en las notas internas", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.crearMensaje.mockResolvedValue({ id: "m1", mensaje: "<p>Hola</p>", adjuntos: [] });

    await service.agregarMensaje(
      ticket.id,
      { mensaje: "<p>Hola</p>", es_nota_interna: true },
      usuarioSoporte
    );

    expect(repository.crearNotificacion).not.toHaveBeenCalled();
  });

  it("avisa la propuesta sin duplicar el mensaje nuevo", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.crearMensaje.mockResolvedValue({
      id: "m1",
      mensaje: "<p>Propongo</p>",
      adjuntos: [],
    });
    repository.updateEstado.mockResolvedValue({ ...ticket, estado: "En_revision" });

    await service.agregarMensaje(
      ticket.id,
      { mensaje: "<p>Propongo</p>", es_propuesta_solucion: true },
      usuarioSoporte
    );

    expect(repository.crearNotificacion).toHaveBeenCalledTimes(1);
    expect(repository.crearNotificacion).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: creador.id,
        mensaje: "Se propuso una solución a tu ticket",
      })
    );
  });

  it("no envía correo cuando el destinatario es Administrador", async () => {
    const ticket = buildTicket("En_proceso", soporte);
    enviarCorreoMock.mockClear();
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.crearMensaje.mockResolvedValue({ id: "m1", mensaje: "<p>Hola</p>", adjuntos: [] });
    repository.buscarUsuarioPorId.mockResolvedValue({
      ...creador,
      rol: { nombre: "Administrador" },
    });

    await service.agregarMensaje(ticket.id, { mensaje: "<p>Hola</p>" }, usuarioSoporte);

    expect(repository.crearNotificacion).toHaveBeenCalled();
    expect(enviarCorreoMock).not.toHaveBeenCalled();
  });
});

describe("TicketsService.asignar", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: TicketsService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new TicketsService(repository);
  });

  it("no se autoavisa cuando el Soporte toma el ticket", async () => {
    const ticket = buildTicket("Abierto", null);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.buscarUsuarioPorId.mockResolvedValue({ ...soporte, rol: { nombre: "Soporte" } });
    repository.asignar.mockResolvedValue({ ...ticket, estado: "En_proceso", asignado_a: soporte });

    await service.asignar(ticket.id, soporte.id, usuarioSoporte);

    expect(repository.crearNotificacion).not.toHaveBeenCalled();
  });
});

describe("TicketsService.aprobar", () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: TicketsService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new TicketsService(repository);
  });

  it("cierra el ticket al aprobar y avisa al Soporte", async () => {
    const ticket = buildTicket("En_revision", soporte);
    repository.buscarPorId.mockResolvedValue(ticket);
    repository.updateEstado.mockResolvedValue({ ...ticket, estado: "Cerrado" });

    const actualizado = await service.aprobar(ticket.id, usuarioCreador);

    expect(repository.updateEstado).toHaveBeenCalledWith(ticket.id, "Cerrado", expect.any(Date));
    expect(actualizado.estado).toBe("Cerrado");
    expect(repository.crearHistorial).toHaveBeenCalledWith(
      expect.objectContaining({ detalle: "Solución aprobada; ticket cerrado" })
    );
    expect(repository.crearNotificacion).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: soporte.id,
        mensaje: "El usuario aprobó la solución y el ticket se cerró",
      })
    );
  });
});
