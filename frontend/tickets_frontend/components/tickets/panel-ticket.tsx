import { BadgeEstado, BadgePrioridad } from "@/components/tickets/badge-estado";
import { formatearFecha } from "@/lib/fechas";
import type { Ticket, TicketUsuario } from "@/types/ticket.types";

const nombreCompleto = (usuario: TicketUsuario) => `${usuario.nombre} ${usuario.apellido_paterno}`;

const Campo = ({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <dt className="text-muted-foreground text-xs">{etiqueta}</dt>
    <dd className="text-right text-xs font-medium">{children}</dd>
  </div>
);

export function PanelTicket({ ticket }: { ticket: Ticket }) {
  return (
    <aside className="bg-card h-fit rounded-lg border p-4">
      <h2 className="mb-4 text-sm font-semibold">Detalles del ticket</h2>

      <dl className="space-y-3">
        <Campo etiqueta="Estado">
          <BadgeEstado estado={ticket.estado} />
        </Campo>
        <Campo etiqueta="Prioridad">
          <BadgePrioridad prioridad={ticket.prioridad} />
        </Campo>
        <Campo etiqueta="Categoría">{ticket.categoria.nombre}</Campo>
        <Campo etiqueta="Área">{ticket.area?.nombre ?? "Sin área"}</Campo>
        <Campo etiqueta="Creador">{nombreCompleto(ticket.usuario_creador)}</Campo>
        <Campo etiqueta="Asignado">
          {ticket.asignado_a ? nombreCompleto(ticket.asignado_a) : "Sin asignar"}
        </Campo>
        <Campo etiqueta="Creado">{formatearFecha(ticket.creado_en)}</Campo>
        <Campo etiqueta="Actualizado">{formatearFecha(ticket.actualizado_en)}</Campo>
        <Campo etiqueta="Cierre">
          {ticket.fecha_cierre ? formatearFecha(ticket.fecha_cierre) : "—"}
        </Campo>
      </dl>
    </aside>
  );
}
