import type { EntidadAuditoria, PaginaAuditoria } from "@/types/auditoria.types";

import { fetchConSesion } from "./api";

interface FiltrosAuditoria {
  pagina?: number;
  limite?: number;
  entidad?: EntidadAuditoria;
}

export const obtenerAuditoria = async (filtros: FiltrosAuditoria = {}) => {
  const params = new URLSearchParams();

  if (filtros.pagina) params.set("pagina", String(filtros.pagina));
  if (filtros.limite) params.set("limite", String(filtros.limite));
  if (filtros.entidad) params.set("entidad", filtros.entidad);

  const consulta = params.toString();

  return fetchConSesion<PaginaAuditoria>(`/auditoria${consulta ? `?${consulta}` : ""}`);
};
