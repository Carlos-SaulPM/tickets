import { describe, expect, it } from "vitest";

import { construirTimeline } from "@/lib/timeline";
import type { HistorialTicket, TicketMensaje, TicketUsuario } from "@/types/ticket.types";

const usuario: TicketUsuario = {
  id: "11111111-1111-4111-8111-111111111111",
  nombre: "Cliente",
  apellido_paterno: "Prueba",
  correo_electronico: "usuario@example.com",
};

const mensaje = (datos: Partial<TicketMensaje> = {}): TicketMensaje => ({
  id: "m1",
  ticket_id: "t1",
  mensaje: "Respuesta",
  es_nota_interna: false,
  es_propuesta_solucion: false,
  creado_en: "2026-11-03T10:00:00.000Z",
  usuario,
  adjuntos: [],
  ...datos,
});

const evento = (datos: Partial<HistorialTicket> = {}): HistorialTicket => ({
  id: "h1",
  tipo_evento: "CREACION",
  estado_anterior: null,
  estado_nuevo: "Abierto",
  detalle: "Ticket creado",
  fecha_cambio: "2026-11-03T09:00:00.000Z",
  usuario,
  ...datos,
});

describe("construirTimeline", () => {
  it("mezcla mensajes y eventos en orden ascendente", () => {
    const timeline = construirTimeline(
      [mensaje({ id: "m1", creado_en: "2026-11-03T10:00:00.000Z" })],
      [
        evento({ id: "h1", fecha_cambio: "2026-11-03T09:00:00.000Z" }),
        evento({
          id: "h2",
          tipo_evento: "CAMBIO_ESTADO",
          estado_anterior: "Abierto",
          estado_nuevo: "En_proceso",
          fecha_cambio: "2026-11-03T11:00:00.000Z",
        }),
      ]
    );

    expect(timeline.map(item => item.id)).toEqual(["h1", "m1", "h2"]);
    expect(timeline.map(item => item.clase)).toEqual(["creacion", "mensaje", "estado"]);
  });

  it("descarta PROPUESTA_SOLUCION porque la cubre el mensaje", () => {
    const timeline = construirTimeline(
      [mensaje({ id: "m1", es_propuesta_solucion: true })],
      [
        evento({
          id: "h1",
          tipo_evento: "PROPUESTA_SOLUCION",
          estado_anterior: "En_proceso",
          estado_nuevo: "En_revision",
          fecha_cambio: "2026-11-03T10:00:00.000Z",
        }),
      ]
    );

    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toMatchObject({ clase: "mensaje", propuesta: true });
  });

  it("marca las notas internas", () => {
    const timeline = construirTimeline([mensaje({ es_nota_interna: true })], []);

    expect(timeline[0]?.notaInterna).toBe(true);
  });

  it("desempata por id cuando la fecha es igual", () => {
    const timeline = construirTimeline(
      [mensaje({ id: "m2", creado_en: "2026-11-03T10:00:00.000Z" })],
      [evento({ id: "h1", fecha_cambio: "2026-11-03T10:00:00.000Z" })]
    );

    expect(timeline.map(item => item.id)).toEqual(["h1", "m2"]);
  });
});
