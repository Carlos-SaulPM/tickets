import { notFound } from "next/navigation";

import { ApiError } from "@/lib/api";
import { construirConsultaTickets } from "@/lib/consulta-tickets";
import type {
  ConsultaTickets,
  HistorialTicket,
  PaginaTickets,
  Ticket,
  TicketMensaje,
} from "@/types/ticket.types";

import { fetchConSesion } from "./api";

export const obtenerTickets = (query: ConsultaTickets) => {
  const search = construirConsultaTickets(query);

  return fetchConSesion<PaginaTickets>(`/tickets${search ? `?${search}` : ""}`);
};

export const obtenerTicket = async (id: string) => {
  try {
    const { data } = await fetchConSesion<{ data: Ticket }>(`/tickets/${id}`);

    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
};

export const obtenerMensajes = async (id: string) =>
  (await fetchConSesion<{ data: TicketMensaje[] }>(`/tickets/${id}/mensajes`)).data;

export const obtenerHistorial = async (id: string) =>
  (await fetchConSesion<{ data: HistorialTicket[] }>(`/tickets/${id}/historial`)).data;
