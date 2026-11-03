import { z } from "zod";

export const loginSchema = {
  body: z.object({
    correo: z.email("El formato del correo es inválido"),
    contrasena: z.string().min(5).max(20),
  }),
};
