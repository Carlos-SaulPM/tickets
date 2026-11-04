import type { RolUsuario } from "./usuario.types";

export interface Rol {
  id: string;
  nombre: RolUsuario;
  descripcion: string | null;
}
