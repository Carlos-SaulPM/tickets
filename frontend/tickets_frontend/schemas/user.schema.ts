import { z } from "zod";

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50),
  apellido_paterno: z.string().trim().min(1, "El apellido paterno es obligatorio").max(50),
  apellido_materno: z.string().trim().min(1, "El apellido materno es obligatorio").max(50),
  correo_electronico: z.string().trim().email("Correo electrónico inválido").max(100),
  rol_id: z.string().min(1, "Selecciona un rol"),
});

export const updateUserSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío").max(50).optional(),
  apellido_paterno: z
    .string()
    .trim()
    .min(1, "El apellido no puede estar vacío")
    .max(50)
    .optional(),
  apellido_materno: z
    .string()
    .trim()
    .min(1, "El apellido no puede estar vacío")
    .max(50)
    .optional(),
  rol_id: z.string().min(1).optional(),
  estado: z.enum(["Activo", "Inactivo", "Baja"]).optional(),
});
