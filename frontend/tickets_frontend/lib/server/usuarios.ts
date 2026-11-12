import type { PaginaUsuarios, Usuario } from "@/types/usuario.types";

import { fetchConSesion } from "./api";

export interface FiltrosUsuarios {
  pagina?: number;
  limite?: number;
  buscar?: string;
  estado?: string;
  rol?: string;
}

export const obtenerUsuarios = async (filtros: FiltrosUsuarios = {}) => {
  const params = new URLSearchParams();

  if (filtros.pagina) params.set("pagina", String(filtros.pagina));
  if (filtros.limite) params.set("limite", String(filtros.limite));
  if (filtros.buscar) params.set("buscar", filtros.buscar);
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.rol) params.set("rol", filtros.rol);

  const consulta = params.toString();

  return fetchConSesion<PaginaUsuarios>(`/users${consulta ? `?${consulta}` : ""}`);
};

export const obtenerSoportes = async () => {
  const { data } = await obtenerUsuarios({ rol: "Soporte", limite: 100 });

  return data.filter((usuario: Usuario) => usuario.estado === "Activo");
};
