import Link from "next/link";
import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { obtenerSesionServidor } from "@/lib/server/sesion";

export const instant = false;

export default async function Home() {
  const sesion = await obtenerSesionServidor();

  if (sesion) {
    redirect("/tickets");
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main id="contenido" className="container mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Tickets</h1>
          <p className="text-muted-foreground">
            Accede con la cuenta asignada por un administrador para crear y dar seguimiento a
            tickets.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/perfil">Ver mi perfil</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
