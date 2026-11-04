"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { NOMBRE_SISTEMA } from "@/lib/marca";
import { authService } from "@/services/auth.service";

const linkClass = (active: boolean) =>
  active
    ? "text-primary border-primary border-b-2 pb-1 text-sm font-medium"
    : "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sesion } = useAuth();

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  return (
    <header className="bg-card/95 supports-[backdrop-filter]:bg-card/80 border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/tickets" className="text-lg font-bold tracking-tight">
            {NOMBRE_SISTEMA}
          </Link>
          <nav className="flex items-center gap-4">
            {sesion && (
              <Link href="/tickets" className={linkClass(pathname.startsWith("/tickets"))}>
                Tickets
              </Link>
            )}
            {sesion?.usuario.rol === "Administrador" && (
              <Link href="/users" className={linkClass(pathname === "/users")}>
                Usuarios
              </Link>
            )}
            {sesion && (
              <Link href="/perfil" className={linkClass(pathname === "/perfil")}>
                Perfil
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {sesion ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium">{sesion.usuario.nombre}</span>
                <Badge variant={sesion.usuario.rol === "Administrador" ? "default" : "secondary"}>
                  {sesion.usuario.rol}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
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
