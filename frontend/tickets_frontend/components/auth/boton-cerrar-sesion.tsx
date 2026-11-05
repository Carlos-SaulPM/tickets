"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

export function BotonCerrarSesion({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter();

  const cerrarSesion = () => {
    authService.logout();
    router.replace("/login");
  };

  return (
    <Button variant="outline" size={compacto ? "sm" : "default"} onClick={cerrarSesion}>
      Cerrar sesión
    </Button>
  );
}
