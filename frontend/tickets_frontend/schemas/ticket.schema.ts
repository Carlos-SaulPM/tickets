import { z } from "zod";

import { PRIORIDADES_TICKET } from "@/types/ticket.types";

export const createTicketSchema = z.object({
  asunto: z.string().trim().min(1, "El asunto es obligatorio").max(150, "Máximo 150 caracteres"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  categoria_id: z.string().min(1, "Selecciona una categoría"),
  area_id: z.string().optional(),
  prioridad: z.enum(PRIORIDADES_TICKET),
});

export type ValoresFormularioTicket = z.infer<typeof createTicketSchema>;

export const createMensajeSchema = z.object({
  mensaje: z.string().trim().min(1, "Escribe un mensaje"),
});
