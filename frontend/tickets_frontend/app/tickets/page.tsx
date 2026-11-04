import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { FiltrosTickets } from "@/components/tickets/filtros-tickets";
import { PaginacionTickets } from "@/components/tickets/paginacion-tickets";
import { TablaTickets } from "@/components/tickets/tabla-tickets";
import { Button } from "@/components/ui/button";
import { leerFiltrosTickets } from "@/lib/consulta-tickets";
import { obtenerTickets } from "@/lib/server/tickets";

export const instant = false;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = leerFiltrosTickets(await searchParams);
  const { data: tickets, meta } = await obtenerTickets(filtros);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground text-sm">
              {meta.total === 0
                ? "Aún no hay tickets registrados"
                : `${meta.total} ${meta.total === 1 ? "ticket" : "tickets"} registrados`}
            </p>
          </div>

          <Button asChild>
            <Link href="/tickets/nuevo">Nuevo ticket</Link>
          </Button>
        </header>

        <FiltrosTickets filtros={filtros} />
        <TablaTickets tickets={tickets} />
        <PaginacionTickets meta={meta} filtros={filtros} />
      </main>
    </div>
  );
}
