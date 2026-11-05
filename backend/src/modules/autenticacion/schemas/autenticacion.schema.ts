import { z } from "zod";

import { NombreRol } from "@/generated/prisma/enums";

export const loginSchema = z.object({
  correo_electronico: z.email("El formato del correo es inválido").max(100),
  contrasena: z.string().min(5).max(200),
});

export const usuarioAutenticadoSchema = z.object({
  id: z.uuid(),
  nombre: z.string(),
  correo_electronico: z.email(),
  rol: z.enum(NombreRol),
});
