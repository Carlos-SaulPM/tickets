import { z } from "zod";

export const createCategoriaSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  descripcion: z.string().trim().nullable().optional(),
});

export const updateCategoriaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    descripcion: z.string().trim().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;
