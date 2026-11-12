import { z } from "zod";

import { NombreRol } from "@/generated/prisma/enums";

export const loginSchema = z.object({
  correo_electronico: z.email("El formato del correo es inválido").max(100),
  contrasena: z.string().min(5).max(200),
});

export const cambiarContrasenaSchema = z.object({
  actual: z.string().min(5).max(200),
  nueva: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
});

export const usuarioAutenticadoSchema = z.object({
  id: z.uuid(),
  nombre: z.string(),
  correo_electronico: z.email(),
  rol: z.enum(NombreRol),
});
