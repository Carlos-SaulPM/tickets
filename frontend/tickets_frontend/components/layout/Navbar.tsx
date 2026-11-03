"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";

const linkClass = (active: boolean) =>
  active
    ? "text-primary border-primary border-b-2 pb-1 text-sm font-medium"
    : "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Sistema de Tickets
          </Link>
          <nav className="flex items-center gap-4">
            {session?.usuario.rol === "Administrador" && (
              <Link href="/users" className={linkClass(pathname === "/users")}>
                Usuarios
              </Link>
            )}
            {session && (
              <Link href="/perfil" className={linkClass(pathname === "/perfil")}>
                Perfil
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-medium">{session.usuario.nombre}</span>
                <Badge variant={session.usuario.rol === "Administrador" ? "default" : "secondary"}>
                  {session.usuario.rol}
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
