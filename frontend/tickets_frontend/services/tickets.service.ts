import { apiFetch } from "@/lib/api";
import type {
  ActualizarTicketInput,
  CrearMensajeInput,
  CrearTicketInput,
  Ticket,
  TicketMensaje,
} from "@/types/ticket.types";

const pedirTicket = (path: string, metodo: string) =>
  apiFetch<{ data: Ticket }>(path, { method: metodo }).then(respuesta => respuesta.data);

export const ticketsService = {
  crear: (datos: CrearTicketInput) =>
    apiFetch<{ data: Ticket }>("/tickets", {
      method: "POST",
      body: JSON.stringify(datos),
    }).then(respuesta => respuesta.data),

  agregarMensaje: (id: string, datos: CrearMensajeInput) =>
    apiFetch<{ data: TicketMensaje }>(`/tickets/${id}/mensajes`, {
      method: "POST",
      body: JSON.stringify(datos),
    }).then(respuesta => respuesta.data),

  asignar: (id: string, asignado_a_id: string) =>
    apiFetch<{ data: Ticket }>(`/tickets/${id}/asignar`, {
      method: "POST",
      body: JSON.stringify({ asignado_a_id }),
    }).then(respuesta => respuesta.data),

  actualizar: (id: string, datos: ActualizarTicketInput) =>
    apiFetch<{ data: Ticket }>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    }).then(respuesta => respuesta.data),

  reabrir: (id: string) =>
    apiFetch<{ data: Ticket }>(`/tickets/${id}/reabrir`, { method: "POST" }).then(
      respuesta => respuesta.data
    ),

  cerrar: (id: string) =>
    apiFetch<{ data: Ticket }>(`/tickets/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado: "Cerrado" }),
    }).then(respuesta => respuesta.data),

  aprobar: (id: string) => pedirTicket(`/tickets/${id}/aprobar`, "POST"),

  rechazar: (id: string) => pedirTicket(`/tickets/${id}/rechazar`, "POST"),
};
