import { z } from "zod";

export const crearAreaSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  activo: z.boolean().optional(),
});

export const actualizarAreaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    activo: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CrearAreaInput = z.infer<typeof crearAreaSchema>;
export type ActualizarAreaInput = z.infer<typeof actualizarAreaSchema>;

export const areasQuerySchema = z.object({
  activo: z.enum(["true", "false", "all"]).default("all"),
});
