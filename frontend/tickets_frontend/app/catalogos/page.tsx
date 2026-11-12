import { GestionCatalogos } from "@/components/catalogos/gestion-catalogos";
import { Navbar } from "@/components/layout/navbar";
import { obtenerAreasTodas, obtenerCategoriasTodas } from "@/lib/server/catalogos";
import { requerirSesion } from "@/lib/server/sesion";

export const instant = false;

export const metadata = {
  title: "Catálogos",
};

export default async function CatalogosPage() {
  const { usuario } = await requerirSesion();

  if (usuario.rol !== "Administrador") {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main id="contenido" className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="mb-2 text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
        </main>
      </div>
    );
  }

  const [areas, categorias] = await Promise.all([obtenerAreasTodas(), obtenerCategoriasTodas()]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main id="contenido" className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Catálogos</h1>
          <p className="text-muted-foreground text-sm">
            Áreas y categorías disponibles al crear un ticket.
          </p>
        </header>

        <GestionCatalogos areas={areas} categorias={categorias} />
      </main>
    </div>
  );
}
