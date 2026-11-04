import type { UsuarioAutenticado } from "@/types/autenticacion.types";

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
