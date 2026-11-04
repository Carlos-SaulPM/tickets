import { apiFetch } from "@/lib/api";
import type {
  CrearMensajeInput,
  CrearTicketInput,
  Ticket,
  TicketMensaje,
} from "@/types/ticket.types";

export const ticketsService = {
  async crear(data: CrearTicketInput) {
    const response = await apiFetch<{ data: Ticket }>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  },

  async agregarMensaje(id: string, data: CrearMensajeInput) {
    const response = await apiFetch<{ data: TicketMensaje }>(`/tickets/${id}/mensajes`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  },

  async asignar(id: string, asignado_a_id: string) {
    const response = await apiFetch<{ data: Ticket }>(`/tickets/${id}/asignar`, {
      method: "POST",
      body: JSON.stringify({ asignado_a_id }),
    });

    return response.data;
  },

  async aprobar(id: string) {
    const response = await apiFetch<{ data: Ticket }>(`/tickets/${id}/aprobar`, { method: "POST" });

    return response.data;
  },

  async rechazar(id: string) {
    const response = await apiFetch<{ data: Ticket }>(`/tickets/${id}/rechazar`, {
      method: "POST",
    });

    return response.data;
  },
};
