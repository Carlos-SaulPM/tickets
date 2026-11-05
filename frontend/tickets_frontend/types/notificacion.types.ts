import type { EstadoTicket } from "./ticket.types";

export interface TicketNotificacion {
  id: string;
  codigo: string;
  asunto: string;
  estado: EstadoTicket;
}

export interface Notificacion {
  id: string;
  ticket_id: string | null;
  mensaje: string;
  leida: boolean;
  creado_en: string;
  ticket: TicketNotificacion | null;
}

export interface PaginaNotificaciones {
  data: Notificacion[];
  meta: { total: number; no_leidas: number };
}
