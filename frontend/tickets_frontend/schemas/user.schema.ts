import { z } from "zod";

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido_paterno: z.string().trim().min(1, "El apellido paterno es obligatorio"),
  apellido_materno: z.string().trim().min(1, "El apellido materno es obligatorio"),
  email: z.string().trim().email("Correo electrónico inválido"),
  id_rol: z.string().min(1, "Selecciona un rol"),
  id_area: z.string().trim().optional(),
});

export const updateUserSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío").optional(),
  apellido_paterno: z.string().trim().min(1, "El apellido no puede estar vacío").optional(),
  apellido_materno: z.string().trim().min(1, "El apellido no puede estar vacío").optional(),
  id_rol: z.string().min(1).optional(),
  id_area: z.string().trim().nullable().optional(),
  estado: z.enum(["Activo", "Inactivo", "Baja"]).optional(),
});
