import type {
  Adjunto,
  EstadoTicket,
  HistorialTicket,
  TicketMensaje,
  TicketUsuario,
  TipoEventoHistorial,
} from "@/types/ticket.types";

export type ClaseEventoTimeline = "creacion" | "mensaje" | "estado" | "reasignacion" | "prioridad";

export interface EventoTimeline {
  id: string;
  fecha: string;
  usuario: TicketUsuario;
  clase: ClaseEventoTimeline;
  detalle: string | null;
  estadoAnterior: EstadoTicket | null;
  estadoNuevo: EstadoTicket | null;
  mensaje: string | null;
  adjuntos: Adjunto[];
  notaInterna: boolean;
  propuesta: boolean;
}

const CLASES: Partial<Record<TipoEventoHistorial, ClaseEventoTimeline>> = {
  CREACION: "creacion",
  CAMBIO_ESTADO: "estado",
  REASIGNACION: "reasignacion",
  CAMBIO_PRIORIDAD: "prioridad",
};

const desdeMensaje = (mensaje: TicketMensaje): EventoTimeline => ({
  id: mensaje.id,
  fecha: mensaje.creado_en,
  usuario: mensaje.usuario,
  clase: "mensaje",
  detalle: null,
  estadoAnterior: null,
  estadoNuevo: null,
  mensaje: mensaje.mensaje,
  adjuntos: mensaje.adjuntos,
  notaInterna: mensaje.es_nota_interna,
  propuesta: mensaje.es_propuesta_solucion,
});

const desdeHistorial = (evento: HistorialTicket): EventoTimeline | null => {
  const clase = CLASES[evento.tipo_evento];

  // PROPUESTA_SOLUCION se representa con el mensaje que la origina.
  if (!clase) return null;

  return {
    id: evento.id,
    fecha: evento.fecha_cambio,
    usuario: evento.usuario,
    clase,
    detalle: evento.detalle,
    estadoAnterior: evento.estado_anterior,
    estadoNuevo: evento.estado_nuevo,
    mensaje: null,
    adjuntos: [],
    notaInterna: false,
    propuesta: false,
  };
};

export const construirTimeline = (
  mensajes: TicketMensaje[],
  historial: HistorialTicket[]
): EventoTimeline[] =>
  [
    ...mensajes.map(desdeMensaje),
    ...historial.map(desdeHistorial).filter((evento): evento is EventoTimeline => evento !== null),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id));
