// src/types/analiticas.types.ts

export interface DashboardMetricasTickets {
  activos: number;
  cerrados: number;
  resueltos: number;
  total: number;
}

export interface DashboardMetricasUsuarios {
  registrados: number;
  activos: number;
  inactivos: number;
}

export interface DashboardAnaliticasDTO {
  tickets: DashboardMetricasTickets;
  usuarios: DashboardMetricasUsuarios;
}