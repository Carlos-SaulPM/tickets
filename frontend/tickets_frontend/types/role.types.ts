import type { UserRole } from "./user.types";

export interface Role {
  id: string;
  nombre: UserRole;
  descripcion: string | null;
}
