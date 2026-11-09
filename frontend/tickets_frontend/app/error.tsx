"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      id="contenido"
      className="bg-background flex min-h-dvh items-center justify-center px-4 py-16"
    >
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Algo salió mal</h1>
        <p className="text-muted-foreground text-sm">
          No pudimos cargar esta sección. Vuelve a intentarlo; si el problema sigue, avisa a un
          administrador.
        </p>
        <Button onClick={reset} className="mt-2">
          Reintentar
        </Button>
      </div>
    </main>
  );
}
