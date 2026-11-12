"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { CampanaNotificaciones } from "@/components/notificaciones/campana-notificaciones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { NOMBRE_SISTEMA } from "@/lib/marca";
import { authService } from "@/services/auth.service";

const claseEnlace = (activo: boolean) =>
  activo
    ? "text-primary border-primary border-b-2 pb-1 text-sm font-medium whitespace-nowrap"
    : "text-muted-foreground hover:text-foreground text-sm font-medium whitespace-nowrap transition-colors";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sesion } = useAuth();

  const enlaces = [
    ...(sesion
      ? [{ href: "/tickets", etiqueta: "Tickets", activo: pathname.startsWith("/tickets") }]
      : []),
    ...(sesion?.usuario.rol === "Administrador"
      ? [{ href: "/users", etiqueta: "Usuarios", activo: pathname === "/users" }]
      : []),
    ...(sesion?.usuario.rol === "Administrador"
      ? [{ href: "/catalogos", etiqueta: "Catálogos", activo: pathname === "/catalogos" }]
      : []),
    ...(sesion?.usuario.rol === "Administrador"
      ? [{ href: "/auditoria", etiqueta: "Auditoría", activo: pathname === "/auditoria" }]
      : []),
    ...(sesion?.usuario.rol === "Administrador" || sesion?.usuario.rol === "Soporte"
      ? [{ href: "/analiticas", etiqueta: "Analíticas", activo: pathname === "/analiticas" }]
      : []),
    ...(sesion ? [{ href: "/perfil", etiqueta: "Perfil", activo: pathname === "/perfil" }] : []),
  ];

  const cerrarSesion = () => {
    authService.logout();
    router.replace("/login");
  };

  return (
    <header className="bg-card/95 supports-[backdrop-filter]:bg-card/80 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/tickets"
            className="shrink-0 text-lg font-bold tracking-tight whitespace-nowrap"
          >
            {NOMBRE_SISTEMA}
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {enlaces.map(enlace => (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={enlace.activo ? "page" : undefined}
                className={claseEnlace(enlace.activo)}
              >
                {enlace.etiqueta}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {sesion ? (
            <>
              <CampanaNotificaciones />

              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-sm font-medium">{sesion.usuario.nombre}</span>
                <Badge variant={sesion.usuario.rol === "Administrador" ? "default" : "secondary"}>
                  {sesion.usuario.rol}
                </Badge>
              </div>

              <div className="hidden md:block">
                <BotonCerrarSesion compacto />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Abrir menú de navegación"
                  >
                    <Menu className="size-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="truncate">
                    {sesion.usuario.nombre}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {enlaces.map(enlace => (
                    <DropdownMenuItem key={enlace.href} asChild>
                      <Link href={enlace.href} aria-current={enlace.activo ? "page" : undefined}>
                        {enlace.etiqueta}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={cerrarSesion}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
