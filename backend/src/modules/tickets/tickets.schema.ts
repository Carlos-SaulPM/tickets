import { z } from "zod";

export const createTicketSchema = z.object({
  asunto: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().min(1),
  prioridad: z.enum(["Baja", "Media", "Alta", "Critica"]).optional(),
  categoria_id: z.uuid(),
  area_id: z.uuid().optional(),
});

export const updateTicketSchema = z
  .object({
    asunto: z.string().trim().min(1).max(150).optional(),
    descripcion: z.string().trim().min(1).optional(),
    prioridad: z.enum(["Baja", "Media", "Alta", "Critica"]).optional(),
    categoria_id: z.uuid().optional(),
    area_id: z.uuid().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export const assignTicketSchema = z.object({
  asignado_a_id: z.uuid(),
});

export const createMensajeSchema = z
  .object({
    mensaje: z.string().trim().min(1),
    es_nota_interna: z.boolean().optional(),
    es_propuesta_solucion: z.boolean().optional(),
  })
  .refine(data => !(data.es_nota_interna && data.es_propuesta_solucion), {
    message: "Una nota interna no puede ser propuesta de solución",
  });

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type CreateMensajeInput = z.infer<typeof createMensajeSchema>;
