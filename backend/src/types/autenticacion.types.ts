import type { z } from "zod";

import type { NombreRol } from "@/generated/prisma/enums";
import type { loginSchema } from "@/modules/autenticacion/schemas/autenticacion.schema";

export type DatosLogin = z.infer<typeof loginSchema.body>;

export type UsuarioAutenticado = {
  id: string;
  nombre: string;
  correo_electronico: string;
  rol: NombreRol;
};
