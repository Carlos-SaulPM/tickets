import type { z } from "zod";

import {
  loginSchema,
  usuarioAutenticadoSchema,
} from "@/modules/autenticacion/schemas/autenticacion.schema";

export type DatosLogin = z.infer<typeof loginSchema>;
export type UsuarioAutenticado = z.infer<typeof usuarioAutenticadoSchema>;
