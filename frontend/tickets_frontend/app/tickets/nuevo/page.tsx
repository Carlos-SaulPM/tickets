import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { FormularioTicket } from "@/components/tickets/formulario-ticket";
import { Button } from "@/components/ui/button";
import { obtenerAreasActivas, obtenerCategorias } from "@/lib/server/catalogos";

export const instant = false;

export default async function NuevoPaginaTickets() {
  const [categorias, areas] = await Promise.all([obtenerCategorias(), obtenerAreasActivas()]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        <header className="space-y-1">
          <Button variant="link" className="h-auto p-0" asChild>
            <Link href="/tickets">Volver a tickets</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo ticket</h1>
          <p className="text-muted-foreground text-sm">
            Describe el problema. Un miembro de soporte lo revisará.
          </p>
        </header>

        <FormularioTicket categorias={categorias} areas={areas} />
      </main>
    </div>
  );
}
