"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { BadgeEstado } from "@/components/tickets/badge-estado";
import { Button } from "@/components/ui/button";
import { formatearFecha } from "@/lib/fechas";
import { avisarCambioDeNotificaciones } from "@/lib/notificaciones";
import { notificacionesService } from "@/services/notificaciones.service";
import type { Notificacion } from "@/types/notificacion.types";

interface ListaNotificacionesProps {
  notificaciones: Notificacion[];
  noLeidas: number;
}

export function ListaNotificaciones({ notificaciones, noLeidas }: ListaNotificacionesProps) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  const marcarTodas = async () => {
    setEnviando(true);

    try {
      const { data } = await notificacionesService.marcarTodas();

      toast.success(
        data.actualizadas === 0
          ? "No había notificaciones sin leer"
          : `${data.actualizadas} notificación(es) marcadas como leídas`
      );
      avisarCambioDeNotificaciones();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron marcar las notificaciones"
      );
    } finally {
      setEnviando(false);
    }
  };

  const marcarUna = async (id: string) => {
    await notificacionesService.marcarLeida(id);
    avisarCambioDeNotificaciones();
    router.refresh();
  };

  if (notificaciones.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-12 text-center text-sm">
        No hay notificaciones para mostrar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {noLeidas > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={marcarTodas} disabled={enviando}>
            {enviando ? "Marcando..." : "Marcar todas como leídas"}
          </Button>
        </div>
      )}

      <ul className="space-y-2">
        {notificaciones.map(notificacion => (
          <li
            key={notificacion.id}
            className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 ${
              notificacion.leida ? "bg-card" : "bg-secondary/40 border-primary/30"
            }`}
          >
            <div className="min-w-0 space-y-1">
              <p className={notificacion.leida ? "text-sm" : "text-sm font-medium"}>
                {notificacion.mensaje}
              </p>
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                {notificacion.ticket && (
                  <>
                    <Link
                      href={`/tickets/${notificacion.ticket.id}`}
                      className="font-mono underline underline-offset-4"
                    >
                      {notificacion.ticket.codigo}
                    </Link>
                    <span className="truncate">{notificacion.ticket.asunto}</span>
                    <BadgeEstado estado={notificacion.ticket.estado} />
                  </>
                )}
                <span>{formatearFecha(notificacion.creado_en)}</span>
              </div>
            </div>

            {!notificacion.leida && (
              <Button variant="ghost" size="sm" onClick={() => void marcarUna(notificacion.id)}>
                Marcar como leída
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
