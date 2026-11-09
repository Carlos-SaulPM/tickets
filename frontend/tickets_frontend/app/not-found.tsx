import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="contenido"
      className="bg-background flex min-h-dvh items-center justify-center px-4 py-16"
    >
      <div className="max-w-md space-y-3 text-center">
        <p className="text-muted-foreground font-mono text-sm">404</p>
        <h1 className="text-2xl font-bold tracking-tight">No encontramos esta página</h1>
        <p className="text-muted-foreground text-sm">
          El ticket o la sección que buscas no existe, o ya no tienes acceso.
        </p>
        <Button asChild className="mt-2">
          <Link href="/tickets">Volver a tickets</Link>
        </Button>
      </div>
    </main>
  );
}
