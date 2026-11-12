export interface DashboardMetricasTickets {
  activos: number;
  cerrados: number;
  resueltos: number;
  total: number;
  tiempo_promedio_cierre_horas: number | null;
}

export interface DashboardMetricasUsuarios {
  registrados: number;
  activos: number;
  inactivos: number;
}

export interface CargaSoporte {
  id: string;
  nombre: string;
  apellido_paterno: string;
  activos: number;
}

export interface DashboardAnaliticasDTO {
  tickets: DashboardMetricasTickets;
  usuarios: DashboardMetricasUsuarios;
  soportes: CargaSoporte[];
}
