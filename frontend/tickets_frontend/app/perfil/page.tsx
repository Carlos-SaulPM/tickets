import Link from "next/link";

import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { Navbar } from "@/components/layout/navbar";
import { FormularioContrasena } from "@/components/perfil/formulario-contrasena";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requerirSesion } from "@/lib/server/sesion";

export const instant = false;

export const metadata = {
  title: "Mi cuenta",
};

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

      <main id="contenido" className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi cuenta</h1>
          <p className="text-muted-foreground text-sm">
            Datos de la cuenta con la que iniciaste sesión.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos de la cuenta</CardTitle>
            <CardDescription>El correo y el rol los administra un administrador.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Campo etiqueta="Nombre">{usuario.nombre}</Campo>
            <Campo etiqueta="Correo">{usuario.correo_electronico}</Campo>

            <div className="grid gap-1">
              <span className="text-muted-foreground text-sm">Rol</span>
              <div>
                <Badge variant="secondary">{usuario.rol}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {usuario.rol === "Administrador" && (
                <Button asChild>
                  <Link href="/users">Gestionar usuarios</Link>
                </Button>
              )}
              <BotonCerrarSesion />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contraseña</CardTitle>
            <CardDescription>Cambia la contraseña con la que inicias sesión.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioContrasena />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
