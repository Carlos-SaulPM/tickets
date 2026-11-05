import type { NombreRol } from "@/generated/prisma/enums";

export interface Rol {
  id: string;
  nombre: NombreRol;
  descripcion: string | null;
}
