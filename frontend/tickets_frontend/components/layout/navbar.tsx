"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { CampanaNotificaciones } from "@/components/notificaciones/campana-notificaciones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { NOMBRE_SISTEMA } from "@/lib/marca";

const claseEnlace = (activo: boolean) =>
  activo
    ? "text-primary border-primary border-b-2 pb-1 text-sm font-medium"
    : "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sesion } = useAuth();

  return (
    <header className="bg-card/95 supports-[backdrop-filter]:bg-card/80 border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/tickets" className="text-lg font-bold tracking-tight">
            {NOMBRE_SISTEMA}
          </Link>
          <nav className="flex items-center gap-4">
            {sesion && (
              <Link href="/tickets" className={claseEnlace(pathname.startsWith("/tickets"))}>
                Tickets
              </Link>
            )}
            {sesion?.usuario.rol === "Administrador" && (
              <Link href="/users" className={claseEnlace(pathname === "/users")}>
                Usuarios
              </Link>
            )}
            {(sesion?.usuario.rol === "Administrador" || sesion?.usuario.rol === "Soporte") && (
              <Link href="/analiticas" className={claseEnlace(pathname === "/analiticas")}>
                Analíticas
              </Link>
            )}
            {sesion && (
              <Link href="/perfil" className={claseEnlace(pathname === "/perfil")}>
                Perfil
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {sesion ? (
            <>
              <CampanaNotificaciones />
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium">{sesion.usuario.nombre}</span>
                <Badge variant={sesion.usuario.rol === "Administrador" ? "default" : "secondary"}>
                  {sesion.usuario.rol}
                </Badge>
              </div>
              <BotonCerrarSesion compacto />
            </>
          ) : (
            <Button size="sm" onClick={() => router.push("/login")}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
