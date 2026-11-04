import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { AccionesAsignacion } from "@/components/tickets/acciones-asignacion";
import { AccionesPropuesta } from "@/components/tickets/acciones-propuesta";
import { BadgeEstado, BadgePrioridad } from "@/components/tickets/badge-estado";
import { CompositorMensajes } from "@/components/tickets/compositor-mensajes";
import { PanelTicket } from "@/components/tickets/panel-ticket";
import { TarjetaSoporte } from "@/components/tickets/tarjeta-soporte";
import { TimelineTicket } from "@/components/tickets/timeline-ticket";
import { Button } from "@/components/ui/button";
import { requerirSesion } from "@/lib/server/sesion";
import { obtenerHistorial, obtenerMensajes, obtenerTicket } from "@/lib/server/tickets";
import { obtenerSoportes } from "@/lib/server/usuarios";
import { construirTimeline } from "@/lib/timeline";

export const instant = false;

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = await requerirSesion();

  const esAdmin = sesion.usuario.rol === "Administrador";
  const esSoporte = sesion.usuario.rol === "Soporte";

  const [ticket, mensajes, historial, soportes] = await Promise.all([
    obtenerTicket(id),
    obtenerMensajes(id),
    obtenerHistorial(id),
    esAdmin ? obtenerSoportes() : Promise.resolve([]),
  ]);

  const eventos = construirTimeline(mensajes, historial);
  const asignacion = [...eventos].reverse().find(evento => evento.clase === "reasignacion");
  const esCreador = sesion.usuario.id === ticket.usuario_creador.id;
  const esperaRespuesta = esCreador && ticket.estado === "En_revision";
  const cerrado = ticket.estado === "Cerrado";
  const asignadoA = ticket.asignado_a?.id ?? null;
  const atiendeSoporte = esSoporte && asignadoA === sesion.usuario.id;
  const asignable = ticket.estado === "Abierto" || ticket.estado === "En_proceso";
  const puedeResponder = !cerrado && (!esSoporte || atiendeSoporte);
  const puedeProponer = atiendeSoporte && ticket.estado === "En_proceso";

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-5xl space-y-6 px-4 pt-8 pb-24">
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href="/tickets">Volver a tickets</Link>
        </Button>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-mono text-sm">{ticket.codigo}</span>
            <BadgeEstado estado={ticket.estado} />
            <BadgePrioridad prioridad={ticket.prioridad} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{ticket.asunto}</h1>
        </header>

        <section aria-labelledby="descripcion-titulo" className="bg-card rounded-lg border p-5">
          <h2 id="descripcion-titulo" className="mb-2 text-sm font-semibold">
            Descripción
          </h2>
          <p className="text-sm whitespace-pre-wrap">{ticket.descripcion}</p>
        </section>

        {esperaRespuesta && (
          <section className="bg-card space-y-3 rounded-lg border p-5">
            <div>
              <h2 className="text-sm font-semibold">Hay una solución propuesta</h2>
              <p className="text-muted-foreground text-sm">
                Revisa la propuesta en la actividad y decide si resuelve el problema.
              </p>
            </div>
            <AccionesPropuesta ticketId={ticket.id} codigo={ticket.codigo} />
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            <h2 id="actividad-titulo" className="text-lg font-semibold">
              Actividad
            </h2>
            <TimelineTicket eventos={eventos} />

            {cerrado ? (
              <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                El ticket está cerrado. No admite respuestas nuevas.
              </p>
            ) : puedeResponder ? (
              <CompositorMensajes ticketId={ticket.id} puedeProponer={puedeProponer} />
            ) : (
              <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                Toma el ticket para poder responder.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <TarjetaSoporte asignado={ticket.asignado_a} desde={asignacion?.fecha ?? null}>
              <AccionesAsignacion
                ticketId={ticket.id}
                codigo={ticket.codigo}
                asignadoId={asignadoA}
                usuarioId={sesion.usuario.id}
                esAdmin={esAdmin}
                esSoporte={esSoporte}
                asignable={asignable}
                soportes={soportes}
              />
            </TarjetaSoporte>
            <PanelTicket ticket={ticket} />
          </div>
        </div>
      </main>
    </div>
  );
}
