import { z } from "zod";

export const loginSchema = {
  body: z.object({
    correo_electronico: z.email("El formato del correo es inválido").max(100),
    contrasena: z.string().min(5).max(200),
  }),
};
