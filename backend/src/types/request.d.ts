import type { UsuarioAutenticado } from "@/types/autenticacion.types";

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
