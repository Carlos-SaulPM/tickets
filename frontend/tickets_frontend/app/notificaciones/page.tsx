import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { ListaNotificaciones } from "@/components/notificaciones/lista-notificaciones";
import { Button } from "@/components/ui/button";
import { obtenerNotificaciones } from "@/lib/server/notificaciones";

export const instant = false;

const FILTROS = [
  { etiqueta: "Todas", valor: false },
  { etiqueta: "No leídas", valor: true },
];

export default async function NotificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ no_leidas?: string }>;
}) {
  const { no_leidas } = await searchParams;
  const soloNoLeidas = no_leidas === "true";
  const { data, meta } = await obtenerNotificaciones(soloNoLeidas);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground text-sm">
            {meta.no_leidas === 0
              ? `${meta.total} en total · todo al día`
              : `${meta.total} en total · ${meta.no_leidas} sin leer`}
          </p>
        </header>

        <nav aria-label="Filtrar notificaciones" className="flex gap-2">
          {FILTROS.map(filtro => {
            const activo = filtro.valor === soloNoLeidas;

            return (
              <Button
                key={filtro.etiqueta}
                variant={activo ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link
                  href={filtro.valor ? "/notificaciones?no_leidas=true" : "/notificaciones"}
                  aria-current={activo ? "page" : undefined}
                >
                  {filtro.etiqueta}
                </Link>
              </Button>
            );
          })}
        </nav>

        <ListaNotificaciones notificaciones={data} noLeidas={meta.no_leidas} />
      </main>
    </div>
  );
}
