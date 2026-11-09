import Link from "next/link";

import { BadgeEstado, BadgePrioridad } from "@/components/tickets/badge-estado";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatearFecha } from "@/lib/fechas";
import type { Ticket } from "@/types/ticket.types";

const nombreAsignado = (ticket: Ticket) =>
  ticket.asignado_a
    ? `${ticket.asignado_a.nombre} ${ticket.asignado_a.apellido_paterno}`
    : "Sin asignar";

export function TablaTickets({ tickets, hayFiltros }: { tickets: Ticket[]; hayFiltros: boolean }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-16 text-center">
        <p className="font-medium">
          {hayFiltros ? "No hay tickets con estos filtros" : "Aún no hay tickets registrados"}
        </p>
        <p className="text-muted-foreground text-sm">
          {hayFiltros ? (
            "Ajusta la búsqueda o limpia los filtros."
          ) : (
            <>
              Crea el primero desde{" "}
              <Link href="/tickets/nuevo" className="underline underline-offset-4">
                Nuevo ticket
              </Link>
              .
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <div className="divide-y md:hidden">
        {tickets.map(ticket => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.id}`}
            className="hover:bg-muted/50 block p-3 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-mono text-xs">{ticket.codigo}</span>
              <span className="text-muted-foreground text-xs">
                {formatearFecha(ticket.creado_en)}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-medium">{ticket.asunto}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <BadgeEstado estado={ticket.estado} />
              <BadgePrioridad prioridad={ticket.prioridad} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{nombreAsignado(ticket)}</p>
          </Link>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead className="hidden lg:table-cell">Categoría</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Asignado a</TableHead>
              <TableHead className="hidden lg:table-cell">Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                    {ticket.codigo}
                  </Link>
                </TableCell>
                <TableCell className="max-w-72 truncate font-medium">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="hover:underline"
                    title={ticket.asunto}
                  >
                    {ticket.asunto}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {ticket.categoria.nombre}
                </TableCell>
                <TableCell>
                  <BadgePrioridad prioridad={ticket.prioridad} />
                </TableCell>
                <TableCell>
                  <BadgeEstado estado={ticket.estado} />
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {nombreAsignado(ticket)}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {formatearFecha(ticket.creado_en)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
