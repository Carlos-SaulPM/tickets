"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EditorMensaje } from "@/components/tickets/editor-mensaje";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { obtenerIdsAdjuntos } from "@/lib/adjuntos";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { ticketsService } from "@/services/tickets.service";

export function CompositorMensajes({
  ticketId,
  puedeProponer,
  puedeNotaInterna,
}: {
  ticketId: string;
  puedeProponer: boolean;
  puedeNotaInterna: boolean;
}) {
  const router = useRouter();
  const [html, setHtml] = useState("");
  const [vacio, setVacio] = useState(true);
  const [claveEditor, setClaveEditor] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [proponer, setProponer] = useState(false);
  const [notaInterna, setNotaInterna] = useState(false);

  const adjuntos = obtenerIdsAdjuntos(html);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (vacio || enviando) return;

    setEnviando(true);

    try {
      await ticketsService.agregarMensaje(ticketId, {
        mensaje: html,
        adjunto_ids: adjuntos,
        es_nota_interna: notaInterna,
        es_propuesta_solucion: proponer,
      });

      setHtml("");
      setVacio(true);
      setProponer(false);
      setNotaInterna(false);
      setClaveEditor(actual => actual + 1);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        router.replace("/login?motivo=expirada");
        return;
      }

      toast.error(error instanceof Error ? error.message : "No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-3" aria-labelledby="responder-titulo">
      <h2 id="responder-titulo" className="text-lg font-semibold">
        Responder
      </h2>

      <EditorMensaje
        key={claveEditor}
        ticketId={ticketId}
        onChange={(contenido, estaVacio) => {
          setHtml(contenido);
          setVacio(estaVacio);
        }}
      />

      {puedeNotaInterna && (
        <div className="flex items-start gap-2 rounded-lg border p-3">
          <input
            id="nota-interna"
            type="checkbox"
            className="mt-0.5 size-4"
            checked={notaInterna}
            onChange={evento => {
              setNotaInterna(evento.target.checked);
              if (evento.target.checked) setProponer(false);
            }}
          />
          <div className="space-y-0.5">
            <Label htmlFor="nota-interna">Nota interna</Label>
            <p className="text-muted-foreground text-xs">
              Solo la ve el equipo de Soporte y Administración. No se envía al creador.
            </p>
          </div>
        </div>
      )}

      {puedeProponer && (
        <div className="flex items-start gap-2 rounded-lg border p-3">
          <input
            id="proponer-solucion"
            type="checkbox"
            className="mt-0.5 size-4"
            checked={proponer}
            onChange={evento => {
              setProponer(evento.target.checked);
              if (evento.target.checked) setNotaInterna(false);
            }}
          />
          <div className="space-y-0.5">
            <Label htmlFor="proponer-solucion">Proponer solución</Label>
            <p className="text-muted-foreground text-xs">
              El ticket pasará a En revisión para que el creador la apruebe o la rechace.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {adjuntos.length === 0
            ? "Puedes adjuntar imágenes con el botón de imagen o pegándolas."
            : `${adjuntos.length} imagen(es) adjunta(s) a este mensaje.`}
        </p>
        <Button type="submit" disabled={vacio || enviando}>
          {enviando ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </form>
  );
}
