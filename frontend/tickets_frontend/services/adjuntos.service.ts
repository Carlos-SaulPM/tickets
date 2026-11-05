import { apiFetch } from "@/lib/api";
import type { Adjunto } from "@/types/ticket.types";

export const adjuntosService = {
  subir: async (ticketId: string, archivo: File) => {
    const datos = new FormData();
    datos.append("archivo", archivo);

    const respuesta = await apiFetch<{ data: Adjunto }>(`/tickets/${ticketId}/adjuntos`, {
      method: "POST",
      body: datos,
    });

    return respuesta.data;
  },
};
