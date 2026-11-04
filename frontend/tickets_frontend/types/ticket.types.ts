import type { Area, Categoria } from "./catalogo.types";

export const ESTADOS_TICKET = [
  "Abierto",
  "En_proceso",
  "En_revision",
  "Resuelto",
  "Cerrado",
] as const;

export const PRIORIDADES_TICKET = ["Baja", "Media", "Alta", "Critica"] as const;

export const ETIQUETAS_ESTADO: Record<(typeof ESTADOS_TICKET)[number], string> = {
  Abierto: "Abierto",
  En_proceso: "En proceso",
  En_revision: "En revisión",
  Resuelto: "Resuelto",
  Cerrado: "Cerrado",
};

export const ETIQUETAS_PRIORIDAD: Record<(typeof PRIORIDADES_TICKET)[number], string> = {
  Baja: "Baja",
  Media: "Media",
  Alta: "Alta",
  Critica: "Crítica",
};

export type EstadoTicket = (typeof ESTADOS_TICKET)[number];
export type PrioridadTicket = (typeof PRIORIDADES_TICKET)[number];

export interface TicketUsuario {
  id: string;
  nombre: string;
  apellido_paterno: string;
  correo_electronico: string;
}

export interface Ticket {
  id: string;
  codigo: string;
  asunto: string;
  descripcion: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  categoria: Pick<Categoria, "id" | "nombre">;
  area: Pick<Area, "id" | "nombre"> | null;
  usuario_creador: TicketUsuario;
  asignado_a: TicketUsuario | null;
  creado_en: string;
  actualizado_en: string;
  fecha_cierre: string | null;
}

export interface MetaTickets {
  pagina: number;
  limite: number;
  total: number;
  total_paginas: number;
}

export interface PaginaTickets {
  data: Ticket[];
  meta: MetaTickets;
}

export interface Adjunto {
  id: string;
  nombre_original: string;
  tipo_mime: string | null;
  ruta_url: string;
}

export interface TicketMensaje {
  id: string;
  ticket_id: string;
  mensaje: string;
  es_nota_interna: boolean;
  es_propuesta_solucion: boolean;
  creado_en: string;
  usuario: TicketUsuario;
  adjuntos: Adjunto[];
}

export interface ConsultaTickets {
  estado?: EstadoTicket;
  prioridad?: PrioridadTicket;
  area_id?: string;
  categoria_id?: string;
  buscar?: string;
  pagina?: number;
  limite?: number;
}

export interface CrearTicketInput {
  asunto: string;
  descripcion: string;
  categoria_id: string;
  area_id?: string;
  prioridad: PrioridadTicket;
}

export interface CrearMensajeInput {
  mensaje: string;
  adjunto_ids?: string[];
  es_propuesta_solucion?: boolean;
}

export const TIPOS_EVENTO_HISTORIAL = [
  "CREACION",
  "CAMBIO_ESTADO",
  "REASIGNACION",
  "CAMBIO_PRIORIDAD",
  "PROPUESTA_SOLUCION",
] as const;

export type TipoEventoHistorial = (typeof TIPOS_EVENTO_HISTORIAL)[number];

export interface HistorialTicket {
  id: string;
  tipo_evento: TipoEventoHistorial;
  estado_anterior: EstadoTicket | null;
  estado_nuevo: EstadoTicket | null;
  detalle: string | null;
  fecha_cambio: string;
  usuario: TicketUsuario;
}
