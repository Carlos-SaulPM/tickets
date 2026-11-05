import type { z } from "zod";

import { ApiError } from "@/utils/api-error";

export const validar = <T extends z.ZodType>(
  schema: T,
  datos: unknown,
  mensaje = "Datos de entrada inválidos"
): z.infer<T> => {
  const resultado = schema.safeParse(datos);

  if (!resultado.success) {
    throw new ApiError(400, mensaje, resultado.error.issues);
  }

  return resultado.data;
};
