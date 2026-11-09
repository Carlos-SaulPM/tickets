import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { FiltrosTickets } from "@/components/tickets/filtros-tickets";
import { PaginacionTickets } from "@/components/tickets/paginacion-tickets";
import { TablaTickets } from "@/components/tickets/tabla-tickets";
import { Button } from "@/components/ui/button";
import { leerFiltrosTickets } from "@/lib/consulta-tickets";
import { requerirSesion } from "@/lib/server/sesion";
import { obtenerTickets } from "@/lib/server/tickets";

export const instant = false;

export const metadata = {
  title: "Tickets",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = leerFiltrosTickets(await searchParams);
  const sesion = await requerirSesion();
  const { data: tickets, meta } = await obtenerTickets(filtros);

  const esStaff = sesion.usuario.rol !== "Usuario";
  const hayFiltros = Boolean(
    filtros.estado ||
    filtros.prioridad ||
    filtros.buscar ||
    (filtros.asignado && filtros.asignado !== "todos") ||
    (filtros.orden && filtros.orden !== "recientes")
  );

  const resumen =
    meta.total === 0
      ? hayFiltros
        ? "Sin resultados para estos filtros"
        : "Aún no hay tickets registrados"
      : `${meta.total} ${meta.total === 1 ? "ticket" : "tickets"} ${
          hayFiltros ? "con estos filtros" : "registrados"
        }`;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground text-sm">{resumen}</p>
          </div>

          <Button asChild>
            <Link href="/tickets/nuevo">Nuevo ticket</Link>
          </Button>
        </header>

        <FiltrosTickets key={JSON.stringify(filtros)} filtros={filtros} mostrarCola={esStaff} />
        <TablaTickets tickets={tickets} hayFiltros={hayFiltros} />
        <PaginacionTickets meta={meta} filtros={filtros} />
      </main>
    </div>
  );
}
