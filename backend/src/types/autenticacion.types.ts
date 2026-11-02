import type { z } from "zod";

import type { loginSchema } from "@/modules/autenticacion/schemas/autenticacion.schema";

export type LoginDatosEntrada = z.infer<typeof loginSchema.body>;

export type AuthUsuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
};
