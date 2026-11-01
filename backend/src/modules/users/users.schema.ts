import { z } from "zod";

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1),
  apellido_paterno: z.string().trim().min(1),
  apellido_materno: z.string().trim().min(1),
  email: z.string().trim().email(),
  id_rol: z.string().min(1),
  id_area: z.string().trim().min(1).optional(),
});

export const updateUserSchema = z
  .object({
    nombre: z.string().trim().min(1).optional(),
    apellido_paterno: z.string().trim().min(1).optional(),
    apellido_materno: z.string().trim().min(1).optional(),
    id_rol: z.string().min(1).optional(),
    id_area: z.string().trim().min(1).nullable().optional(),
    estado: z.enum(["Activo", "Inactivo", "Baja"]).optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
