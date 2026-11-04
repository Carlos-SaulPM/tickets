import { z } from "zod";

export const crearCategoriaSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  descripcion: z.string().trim().nullable().optional(),
});

export const actualizarCategoriaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    descripcion: z.string().trim().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CrearCategoriaInput = z.infer<typeof crearCategoriaSchema>;
export type ActualizarCategoriaInput = z.infer<typeof actualizarCategoriaSchema>;
