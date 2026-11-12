import type { z } from "zod";

import {
  cambiarContrasenaSchema,
  loginSchema,
  usuarioAutenticadoSchema,
} from "@/modules/autenticacion/schemas/autenticacion.schema";

export type DatosLogin = z.infer<typeof loginSchema>;
export type DatosCambioContrasena = z.infer<typeof cambiarContrasenaSchema>;
export type UsuarioAutenticado = z.infer<typeof usuarioAutenticadoSchema>;
