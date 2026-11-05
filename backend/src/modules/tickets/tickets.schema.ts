import { z } from "zod";

export const crearTicketSchema = z.object({
  asunto: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().min(1),
  prioridad: z.enum(["Baja", "Media", "Alta", "Critica"]).optional(),
  categoria_id: z.uuid(),
  area_id: z.uuid().optional(),
});

export const actualizarTicketSchema = z
  .object({
    asunto: z.string().trim().min(1).max(150).optional(),
    descripcion: z.string().trim().min(1).optional(),
    prioridad: z.enum(["Baja", "Media", "Alta", "Critica"]).optional(),
    categoria_id: z.uuid().optional(),
    area_id: z.uuid().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export const asignarTicketSchema = z.object({
  asignado_a_id: z.uuid(),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(["Abierto", "En_proceso", "En_revision", "Resuelto", "Cerrado"]),
});

export const listarTicketsQuerySchema = z.object({
  estado: z.enum(["Abierto", "En_proceso", "En_revision", "Resuelto", "Cerrado"]).optional(),
  prioridad: z.enum(["Baja", "Media", "Alta", "Critica"]).optional(),
  area_id: z.uuid().optional(),
  categoria_id: z.uuid().optional(),
  buscar: z.string().trim().min(1).max(100).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export const listarNotificacionesQuerySchema = z.object({
  limite: z.coerce.number().int().min(1).max(100).default(20),
  no_leidas: z
    .enum(["true", "false"])
    .default("false")
    .transform(valor => valor === "true"),
});

export const crearMensajeSchema = z
  .object({
    mensaje: z.string().trim().min(1).max(20_000),
    es_nota_interna: z.boolean().optional(),
    es_propuesta_solucion: z.boolean().optional(),
    adjunto_ids: z.array(z.uuid()).max(5).optional(),
  })
  .refine(data => !(data.es_nota_interna && data.es_propuesta_solucion), {
    message: "Una nota interna no puede ser propuesta de solución",
  });

export type CrearTicketInput = z.infer<typeof crearTicketSchema>;
export type ActualizarTicketInput = z.infer<typeof actualizarTicketSchema>;
export type AsignarTicketInput = z.infer<typeof asignarTicketSchema>;
export type CrearMensajeInput = z.infer<typeof crearMensajeSchema>;
export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>;
export type ListarTicketsQuery = z.infer<typeof listarTicketsQuerySchema>;
export type ListarNotificacionesQuery = z.infer<typeof listarNotificacionesQuerySchema>;
