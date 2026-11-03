import { z } from "zod";

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  apellido_paterno: z.string().trim().min(1).max(50),
  apellido_materno: z.string().trim().min(1).max(50),
  correo_electronico: z.string().trim().email().max(100),
  rol_id: z.uuid(),
});

export const updateUserSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    apellido_paterno: z.string().trim().min(1).max(50).optional(),
    apellido_materno: z.string().trim().min(1).max(50).optional(),
    rol_id: z.uuid().optional(),
    estado: z.enum(["Activo", "Inactivo", "Baja"]).optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
