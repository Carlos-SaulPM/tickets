import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdjuntosRepository } from "@/modules/tickets/adjuntos.repository";
import { AdjuntosService } from "@/modules/tickets/adjuntos.service";
import { TicketRepository } from "@/modules/tickets/tickets.repository";
import type {
  AdjuntoConTicket,
  Ticket,
  TicketUsuarioResumen,
} from "@/modules/tickets/tickets.types";
import type { UsuarioAutenticado } from "@/types/autenticacion.types";

const TICKET_ID = "44444444-4444-4444-8444-444444444444";
const ADJUNTO_ID = "66666666-6666-4666-8666-666666666666";

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

const usuarioCreador: UsuarioAutenticado = {
  id: creador.id,
  nombre: creador.nombre,
  correo_electronico: creador.correo_electronico,
  rol: "Usuario",
};

const usuarioSoporte: UsuarioAutenticado = {
  id: soporte.id,
  nombre: soporte.nombre,
  correo_electronico: soporte.correo_electronico,
  rol: "Soporte",
};

const usuarioAjeno: UsuarioAutenticado = {
  id: "77777777-7777-4777-8777-777777777777",
  nombre: "Ajeno",
  correo_electronico: "ajeno@example.com",
  rol: "Usuario",
};

const buildTicket = (asignado: TicketUsuarioResumen | null): Ticket => ({
  id: TICKET_ID,
  codigo: "#TK-001",
  asunto: "No enciende",
  descripcion: "La computadora no enciende.",
  prioridad: "Media",
  estado: "Abierto",
  categoria: { id: "55555555-5555-4555-8555-555555555555", nombre: "Hardware" },
  area: null,
  usuario_creador: creador,
  asignado_a: asignado,
  creado_en: new Date("2026-01-01T00:00:00.000Z"),
  actualizado_en: new Date("2026-01-01T00:00:00.000Z"),
  fecha_cierre: null,
});

const buildAdjunto = (asignadoA: string | null): AdjuntoConTicket => ({
  id: ADJUNTO_ID,
  nombre_original: "captura.png",
  tipo_mime: "image/png",
  ruta_url: `/api/v1/adjuntos/${ADJUNTO_ID}`,
  nombre_almacenado: `tickets/${TICKET_ID}/8efc07d3-dbdf-4eda-ac39-79052cb94406.png`,
  ticket: {
    id: TICKET_ID,
    usuario_creador_id: creador.id,
    asignado_a_id: asignadoA,
  },
});

const archivo = {
  originalname: "captura.png",
  filename: "8efc07d3-dbdf-4eda-ac39-79052cb94406.png",
  mimetype: "image/png",
} as Express.Multer.File;

describe("AdjuntosService.crear", () => {
  let repository: AdjuntosRepository;
  let ticketsRepository: TicketRepository;
  let service: AdjuntosService;

  beforeEach(() => {
    repository = new AdjuntosRepository();
    ticketsRepository = new TicketRepository();
    service = new AdjuntosService(repository, ticketsRepository);
  });

  it("exige un archivo", async () => {
    const buscar = vi.spyOn(ticketsRepository, "buscarPorId");

    await expect(service.crear(TICKET_ID, usuarioCreador)).rejects.toMatchObject({
      status: 400,
      message: "Adjunta una imagen",
    });

    expect(buscar).not.toHaveBeenCalled();
  });

  it("rechaza un ticket inexistente", async () => {
    vi.spyOn(ticketsRepository, "buscarPorId").mockResolvedValue(null);

    await expect(service.crear(TICKET_ID, usuarioCreador, archivo)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("rechaza a quien no puede ver el ticket", async () => {
    vi.spyOn(ticketsRepository, "buscarPorId").mockResolvedValue(buildTicket(soporte));
    const crear = vi.spyOn(repository, "crear");

    await expect(service.crear(TICKET_ID, usuarioAjeno, archivo)).rejects.toMatchObject({
      status: 403,
    });

    expect(crear).not.toHaveBeenCalled();
  });

  it("rechaza un ticket cerrado", async () => {
    vi.spyOn(ticketsRepository, "buscarPorId").mockResolvedValue({
      ...buildTicket(soporte),
      estado: "Cerrado",
    });
    const crear = vi.spyOn(repository, "crear");

    await expect(service.crear(TICKET_ID, usuarioSoporte, archivo)).rejects.toMatchObject({
      status: 400,
    });

    expect(crear).not.toHaveBeenCalled();
  });

  it("guarda el adjunto con la ruta del ticket y la URL de la API", async () => {
    vi.spyOn(ticketsRepository, "buscarPorId").mockResolvedValue(buildTicket(soporte));
    const crear = vi.spyOn(repository, "crear").mockResolvedValue(buildAdjunto(soporte.id));

    const adjunto = await service.crear(TICKET_ID, usuarioSoporte, archivo);
    const datos = crear.mock.calls[0]?.[0];

    expect(adjunto).toEqual(buildAdjunto(soporte.id));
    expect(datos?.ruta_url).toBe(`/api/v1/adjuntos/${datos?.id}`);
    expect(datos?.nombre_almacenado).toBe(`tickets/${TICKET_ID}/${archivo.filename}`);
    expect(datos).toMatchObject({
      ticket_id: TICKET_ID,
      nombre_original: archivo.originalname,
      tipo_mime: archivo.mimetype,
      subido_por_id: usuarioSoporte.id,
    });
  });
});

describe("AdjuntosService.obtenerParaDescarga", () => {
  let repository: AdjuntosRepository;
  let service: AdjuntosService;

  beforeEach(() => {
    repository = new AdjuntosRepository();
    service = new AdjuntosService(repository, new TicketRepository());
  });

  it("devuelve el adjunto al creador", async () => {
    vi.spyOn(repository, "buscarPorId").mockResolvedValue(buildAdjunto(null));

    await expect(service.obtenerParaDescarga(ADJUNTO_ID, usuarioCreador)).resolves.toMatchObject({
      nombre_original: "captura.png",
    });
  });

  it("rechaza un adjunto inexistente", async () => {
    vi.spyOn(repository, "buscarPorId").mockResolvedValue(null);

    await expect(service.obtenerParaDescarga(ADJUNTO_ID, usuarioCreador)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("rechaza a un Soporte que no atiende el ticket", async () => {
    vi.spyOn(repository, "buscarPorId").mockResolvedValue(buildAdjunto(creador.id));

    await expect(service.obtenerParaDescarga(ADJUNTO_ID, usuarioSoporte)).rejects.toMatchObject({
      status: 403,
    });
  });

  it("permite al Soporte asignado", async () => {
    vi.spyOn(repository, "buscarPorId").mockResolvedValue(buildAdjunto(soporte.id));

    await expect(service.obtenerParaDescarga(ADJUNTO_ID, usuarioSoporte)).resolves.toMatchObject({
      nombre_original: "captura.png",
    });
  });
});
