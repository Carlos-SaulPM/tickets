"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { getSession } from "@/lib/session";
import { authService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth.types";

export default function PerfilPage() {
  const router = useRouter();
  const { session, isClient } = useAuth();

  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isClient && !getSession()) {
      router.replace("/login");
    }
  }, [isClient, session, router]);

  useEffect(() => {
    if (!isClient || !session) return;

    let cancelled = false;

    authService
      .getPerfil()
      .then(data => {
        if (!cancelled) setUsuario(data);
      })
      .catch((perfilError: unknown) => {
        if (cancelled) return;

        if (perfilError instanceof ApiError && perfilError.status === 401) {
          authService.logout();
          router.replace("/login");
          return;
        }

        setError(
          perfilError instanceof Error ? perfilError.message : "No se pudo cargar el perfil"
        );
      });

    return () => {
      cancelled = true;
    };
  }, [isClient, session, router]);

  if (!isClient || !session) {
    return (
      <div className="text-muted-foreground p-8 text-sm">Redirigiendo al inicio de sesión...</div>
    );
  }

  const perfil = usuario ?? session.usuario;

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>Datos de la cuenta con la que iniciaste sesión.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="grid gap-1">
              <span className="text-muted-foreground text-sm">Nombre</span>
              <span className="font-medium">{perfil.nombre}</span>
            </div>

            <div className="grid gap-1">
              <span className="text-muted-foreground text-sm">Correo</span>
              <span className="font-medium">{perfil.correo_electronico}</span>
            </div>

            <div className="grid gap-1">
              <span className="text-muted-foreground text-sm">Rol</span>
              <div>
                <Badge variant={perfil.rol === "Administrador" ? "default" : "secondary"}>
                  {perfil.rol}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {perfil.rol === "Administrador" && (
                <Button onClick={() => router.push("/users")}>Gestionar usuarios</Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
