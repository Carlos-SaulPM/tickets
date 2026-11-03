"use client";

import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Tickets</h1>
          <p className="text-muted-foreground">
            Accede con la cuenta asignada por un administrador para gestionar tickets y usuarios.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/login")}>Iniciar sesión</Button>
          <Button variant="outline" onClick={() => router.push("/perfil")}>
            Ver mi perfil
          </Button>
        </div>
      </main>
    </div>
  );
}
