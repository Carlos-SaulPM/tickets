import { ArrowRightLeft, CircleDot, Flag, Lock, MessageSquare, UserPlus } from "lucide-react";

import { ContenidoMensaje } from "@/components/tickets/contenido-mensaje";
import { Badge } from "@/components/ui/badge";
import { formatearFecha } from "@/lib/fechas";
import type { EventoTimeline } from "@/lib/timeline";
import { ETIQUETAS_ESTADO } from "@/types/ticket.types";
import type { EstadoTicket } from "@/types/ticket.types";

const CLASES_NODO = {
  creacion:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  mensaje:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  estado:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  reasignacion:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
  prioridad:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
} as const;

const ICONOS = {
  creacion: CircleDot,
  mensaje: MessageSquare,
  estado: ArrowRightLeft,
  reasignacion: UserPlus,
  prioridad: Flag,
} as const;

const etiquetaEstado = (estado: EstadoTicket | null) => (estado ? ETIQUETAS_ESTADO[estado] : "—");

const resumen = (evento: EventoTimeline) => {
  switch (evento.clase) {
    case "creacion":
      return "creó el ticket";
    case "estado":
      return `cambió el estado de ${etiquetaEstado(evento.estadoAnterior)} a ${etiquetaEstado(
        evento.estadoNuevo
      )}`;
    case "reasignacion":
      return evento.detalle ?? "reasignó el ticket";
    case "prioridad":
      return evento.detalle ?? "cambió la prioridad";
    default:
      return null;
  }
};

export function TimelineTicket({ eventos }: { eventos: EventoTimeline[] }) {
  if (eventos.length === 0) {
    return <p className="text-muted-foreground text-sm">Todavía no hay actividad registrada.</p>;
  }

  return (
    <ol className="border-border relative ml-3 space-y-6 border-l pl-6">
      {eventos.map(evento => {
        const Icono = ICONOS[evento.clase];
        const esMensaje = evento.clase === "mensaje";

        return (
          <li key={evento.id} className="relative">
            <span
              className={`absolute top-0 -left-[2.1rem] flex size-6 items-center justify-center rounded-full border ${CLASES_NODO[evento.clase]}`}
            >
              <Icono className="size-3.5" aria-hidden />
            </span>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{evento.usuario.nombre}</span>
              <span className="text-muted-foreground text-xs">{formatearFecha(evento.fecha)}</span>
              {evento.notaInterna && (
                <Badge variant="outline">
                  <Lock aria-hidden /> Nota interna
                </Badge>
              )}
              {evento.propuesta && <Badge variant="secondary">Propuesta de solución</Badge>}
            </div>

            {esMensaje ? (
              <div className="bg-card mt-2 rounded-lg border px-3 py-2">
                <ContenidoMensaje contenido={evento.mensaje ?? ""} adjuntos={evento.adjuntos} />
                {evento.propuesta && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    El ticket pasó a En revisión esperando respuesta del creador.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">{resumen(evento)}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
