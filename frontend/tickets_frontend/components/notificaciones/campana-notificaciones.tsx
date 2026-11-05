"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

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
import { formatearFecha } from "@/lib/fechas";
import { alCambiarNotificaciones, avisarCambioDeNotificaciones } from "@/lib/notificaciones";
import { notificacionesService } from "@/services/notificaciones.service";
import type { Notificacion } from "@/types/notificacion.types";

const VISIBLES = 5;
const INTERVALO_MS = 60_000;

const contadorVisible = (total: number) => (total > 9 ? "9+" : String(total));

export function CampanaNotificaciones() {
  const { sesion } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);

  const cargar = useCallback(async () => {
    if (!sesion) return;

    try {
      const { data, meta } = await notificacionesService.listar({ limite: VISIBLES });

      setNotificaciones(data);
      setNoLeidas(meta.no_leidas);
    } catch {
      // Un fallo del contador no debe interrumpir la navegación.
    }
  }, [sesion]);

  useEffect(() => {
    if (!sesion) return;

    // Se difiere al siguiente tick para no encadenar renders durante el montaje.
    queueMicrotask(() => void cargar());

    const intervalo = setInterval(() => void cargar(), INTERVALO_MS);
    const dejarDeEscuchar = alCambiarNotificaciones(() => void cargar());
    const alVolverALaPestana = () => {
      if (document.visibilityState === "visible") void cargar();
    };

    document.addEventListener("visibilitychange", alVolverALaPestana);

    return () => {
      clearInterval(intervalo);
      dejarDeEscuchar();
      document.removeEventListener("visibilitychange", alVolverALaPestana);
    };
  }, [cargar, sesion]);

  const marcarLeida = async (id: string) => {
    await notificacionesService.marcarLeida(id);
    avisarCambioDeNotificaciones();
  };

  if (!sesion) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={noLeidas === 0 ? "Notificaciones" : `Notificaciones, ${noLeidas} sin leer`}
        >
          <Bell aria-hidden />
          {noLeidas > 0 && (
            <span
              aria-hidden
              className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums"
            >
              {contadorVisible(noLeidas)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificaciones
          {noLeidas > 0 && (
            <span className="text-muted-foreground text-xs font-normal">{noLeidas} sin leer</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notificaciones.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            No tienes notificaciones.
          </p>
        ) : (
          notificaciones.map(notificacion => (
            <DropdownMenuItem
              key={notificacion.id}
              asChild
              className="items-start gap-2 py-2 whitespace-normal"
            >
              <Link
                href={
                  notificacion.ticket ? `/tickets/${notificacion.ticket.id}` : "/notificaciones"
                }
                onClick={() => void marcarLeida(notificacion.id)}
              >
                <span
                  aria-hidden
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    notificacion.leida ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <span className="space-y-0.5">
                  <span className={notificacion.leida ? "block" : "block font-medium"}>
                    {notificacion.mensaje}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {notificacion.ticket?.codigo} · {formatearFecha(notificacion.creado_en)}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notificaciones" className="justify-center font-medium">
            Ver todas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
