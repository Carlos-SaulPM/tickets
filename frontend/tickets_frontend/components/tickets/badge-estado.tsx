import { Badge } from "@/components/ui/badge";
import { ETIQUETAS_ESTADO, ETIQUETAS_PRIORIDAD } from "@/types/ticket.types";
import type { EstadoTicket, PrioridadTicket } from "@/types/ticket.types";

const CLASES_ESTADO: Record<EstadoTicket, string> = {
  Abierto:
    "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
  En_proceso:
    "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  En_revision:
    "border-violet-200 bg-violet-100 text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100",
  Resuelto:
    "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  Cerrado:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

const CLASES_PRIORIDAD: Record<PrioridadTicket, string> = {
  Baja: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Media:
    "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
  Alta: "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  Critica:
    "border-red-200 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
};

export function BadgeEstado({ estado }: { estado: EstadoTicket }) {
  return (
    <Badge variant="outline" className={CLASES_ESTADO[estado]}>
      {ETIQUETAS_ESTADO[estado]}
    </Badge>
  );
}

export function BadgePrioridad({ prioridad }: { prioridad: PrioridadTicket }) {
  return (
    <Badge variant="outline" className={CLASES_PRIORIDAD[prioridad]}>
      {ETIQUETAS_PRIORIDAD[prioridad]}
    </Badge>
  );
}
