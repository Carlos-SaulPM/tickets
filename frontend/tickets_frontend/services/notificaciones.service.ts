import { apiFetch } from "@/lib/api";
import type { PaginaNotificaciones } from "@/types/notificacion.types";

interface FiltrosNotificaciones {
  limite?: number;
  noLeidas?: boolean;
}

const construirConsulta = ({ limite = 20, noLeidas = false }: FiltrosNotificaciones) => {
  const parametros = new URLSearchParams({ limite: String(limite) });

  if (noLeidas) parametros.set("no_leidas", "true");

  return parametros.toString();
};

export const notificacionesService = {
  listar: (filtros: FiltrosNotificaciones = {}) =>
    apiFetch<PaginaNotificaciones>(`/notificaciones?${construirConsulta(filtros)}`),

  marcarLeida: (id: string) =>
    apiFetch<{ message: string }>(`/notificaciones/${id}/leida`, { method: "PATCH" }),

  marcarTodas: () =>
    apiFetch<{ data: { actualizadas: number } }>("/notificaciones/leidas", { method: "PATCH" }),
};
