import type { NombreRol } from "@/generated/prisma/enums";

export interface Role {
  id: string;
  nombre: NombreRol;
  descripcion: string | null;
}
