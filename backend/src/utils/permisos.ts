import { NombreRol } from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";

export const exigirAdministrador = (rol: NombreRol | undefined) => {
  if (rol !== NombreRol.Administrador) {
    throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
  }
};
