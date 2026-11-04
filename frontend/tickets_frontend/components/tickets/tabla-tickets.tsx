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

export function TablaTickets({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-16 text-center">
        <p className="font-medium">No hay tickets con estos filtros</p>
        <p className="text-muted-foreground text-sm">
          Ajusta la búsqueda o{" "}
          <Link href="/tickets/nuevo" className="underline underline-offset-4">
            crea un ticket nuevo
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-24">Código</TableHead>
            <TableHead>Asunto</TableHead>
            <TableHead className="hidden md:table-cell">Categoría</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden lg:table-cell">Asignado a</TableHead>
            <TableHead className="hidden md:table-cell">Creado</TableHead>
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
                <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                  {ticket.asunto}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground hidden md:table-cell">
                {ticket.categoria.nombre}
              </TableCell>
              <TableCell>
                <BadgePrioridad prioridad={ticket.prioridad} />
              </TableCell>
              <TableCell>
                <BadgeEstado estado={ticket.estado} />
              </TableCell>
              <TableCell className="text-muted-foreground hidden lg:table-cell">
                {ticket.asignado_a ? ticket.asignado_a.nombre : "Sin asignar"}
              </TableCell>
              <TableCell className="text-muted-foreground hidden md:table-cell">
                {formatearFecha(ticket.creado_en)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
