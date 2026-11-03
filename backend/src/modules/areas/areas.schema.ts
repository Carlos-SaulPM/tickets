import { z } from "zod";

export const createAreaSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  activo: z.boolean().optional(),
});

export const updateAreaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    activo: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
