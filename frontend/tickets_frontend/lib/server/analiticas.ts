import { DashboardAnaliticasDTO } from "@/types/analiticas.types";
import { fetchConSesion } from "./api";

export const obtenerAnaliticasDashboard = async () => {
  return (await fetchConSesion<{ data: DashboardAnaliticasDTO }>(
    "/analiticas/dashboard"
  )).data;
};