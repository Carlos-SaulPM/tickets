import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requerirSesion } from "@/lib/server/sesion";

export const instant = false;

const Campo = ({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) => (
  <div className="grid gap-1">
    <span className="text-muted-foreground text-sm">{etiqueta}</span>
    <span className="font-medium">{children}</span>
  </div>
);

export default async function PerfilPage() {
  const { usuario } = await requerirSesion();

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>Datos de la cuenta con la que iniciaste sesión.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Campo etiqueta="Nombre">{usuario.nombre}</Campo>
            <Campo etiqueta="Correo">{usuario.correo_electronico}</Campo>

            <div className="grid gap-1">
              <span className="text-muted-foreground text-sm">Rol</span>
              <div>
                <Badge variant={usuario.rol === "Administrador" ? "default" : "secondary"}>
                  {usuario.rol}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap  pt-2">
              {usuario.rol === "Administrador" && (
                <Button asChild>
                  <Link href="/users">Gestionar usuarios</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
