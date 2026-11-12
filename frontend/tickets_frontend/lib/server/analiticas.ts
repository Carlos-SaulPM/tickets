import type { DashboardAnaliticasDTO } from "@/types/analiticas.types";

import { fetchConSesion } from "./api";

export interface FiltrosAnaliticas {
  desde?: string;
  hasta?: string;
  area_id?: string;
  categoria_id?: string;
  asignado_a_id?: string;
}

export const obtenerAnaliticasDashboard = async (filtros: FiltrosAnaliticas = {}) => {
  const params = new URLSearchParams();

  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);
  if (filtros.area_id) params.set("area_id", filtros.area_id);
  if (filtros.categoria_id) params.set("categoria_id", filtros.categoria_id);
  if (filtros.asignado_a_id) params.set("asignado_a_id", filtros.asignado_a_id);

  const consulta = params.toString();

  return (
    await fetchConSesion<{ data: DashboardAnaliticasDTO }>(
      `/analiticas/dashboard${consulta ? `?${consulta}` : ""}`
    )
  ).data;
};
