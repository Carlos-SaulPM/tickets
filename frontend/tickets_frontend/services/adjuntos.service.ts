import { apiFetch } from "@/lib/api";
import type { Adjunto } from "@/types/ticket.types";

export const adjuntosService = {
  async subir(ticketId: string, archivo: File) {
    const datos = new FormData();
    datos.append("archivo", archivo);

    const response = await apiFetch<{ data: Adjunto }>(`/tickets/${ticketId}/adjuntos`, {
      method: "POST",
      body: datos,
    });

    return response.data;
  },
};
