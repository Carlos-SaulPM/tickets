import { ESTADOS_TICKET, PRIORIDADES_TICKET } from "@/types/ticket.types";
import type { ConsultaTickets, EstadoTicket, PrioridadTicket } from "@/types/ticket.types";

export const TICKETS_POR_PAGINA = 10;

const texto = (valor: string | string[] | undefined) =>
  typeof valor === "string" && valor.trim() ? valor.trim() : undefined;

const esEstado = (valor: string | undefined): valor is EstadoTicket =>
  ESTADOS_TICKET.some(estado => estado === valor);

const esPrioridad = (valor: string | undefined): valor is PrioridadTicket =>
  PRIORIDADES_TICKET.some(prioridad => prioridad === valor);

export const construirConsultaTickets = (query: ConsultaTickets = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([clave, valor]) => {
    if (valor === undefined || valor === null || valor === "") return;

    params.set(clave, String(valor));
  });

  return params.toString();
};

export const leerFiltrosTickets = (
  params: Record<string, string | string[] | undefined>
): ConsultaTickets => {
  const estado = texto(params.estado);
  const prioridad = texto(params.prioridad);
  const buscar = texto(params.buscar);
  const pagina = Number(texto(params.pagina));

  return {
    estado: esEstado(estado) ? estado : undefined,
    prioridad: esPrioridad(prioridad) ? prioridad : undefined,
    buscar,
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    limite: TICKETS_POR_PAGINA,
  };
};
