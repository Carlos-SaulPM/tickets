"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { ticketsService } from "@/services/tickets.service";
import type { Area, Categoria } from "@/types/catalogo.types";
import {
  ETIQUETAS_PRIORIDAD,
  PRIORIDADES_TICKET,
  type PrioridadTicket,
  type Ticket,
} from "@/types/ticket.types";

const SIN_AREA = "sin-area";

interface AccionesTicketProps {
  ticket: Ticket;
  puedeEditar: boolean;
  puedeCerrar: boolean;
  puedeReabrir: boolean;
  categorias: Categoria[];
  areas: Area[];
}

export function AccionesTicket({
  ticket,
  puedeEditar,
  puedeCerrar,
  puedeReabrir,
  categorias,
  areas,
}: AccionesTicketProps) {
  const router = useRouter();

  const [editando, setEditando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [reabriendo, setReabriendo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [asunto, setAsunto] = useState(ticket.asunto);
  const [prioridad, setPrioridad] = useState(ticket.prioridad);
  const [categoriaId, setCategoriaId] = useState(ticket.categoria.id);
  const [areaId, setAreaId] = useState(ticket.area?.id ?? SIN_AREA);

  if (!puedeEditar && !puedeCerrar && !puedeReabrir) return null;

  const manejarError = (error: unknown, mensaje: string) => {
    if (error instanceof ApiError && error.status === 401) {
      authService.logout();
      router.replace("/login?motivo=expirada");
      return;
    }

    toast.error(error instanceof Error ? error.message : mensaje);
  };

  const abrirEdicion = () => {
    setAsunto(ticket.asunto);
    setPrioridad(ticket.prioridad);
    setCategoriaId(ticket.categoria.id);
    setAreaId(ticket.area?.id ?? SIN_AREA);
    setEditando(true);
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!asunto.trim()) {
      toast.error("El asunto no puede estar vacío");
      return;
    }

    setEnviando(true);

    try {
      await ticketsService.actualizar(ticket.id, {
        asunto: asunto.trim(),
        prioridad,
        categoria_id: categoriaId,
        area_id: areaId === SIN_AREA ? null : areaId,
      });
      toast.success("Ticket actualizado");
      setEditando(false);
      router.refresh();
    } catch (error) {
      manejarError(error, "No se pudo actualizar el ticket");
    } finally {
      setEnviando(false);
    }
  };

  const reabrir = async () => {
    setEnviando(true);

    try {
      await ticketsService.reabrir(ticket.id);
      toast.success("Ticket reabierto");
      setReabriendo(false);
      router.refresh();
    } catch (error) {
      manejarError(error, "No se pudo reabrir el ticket");
    } finally {
      setEnviando(false);
    }
  };

  const cerrar = async () => {
    setEnviando(true);

    try {
      await ticketsService.cerrar(ticket.id);
      toast.success("Ticket cerrado");
      setCerrando(false);
      router.refresh();
    } catch (error) {
      manejarError(error, "No se pudo cerrar el ticket");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {puedeEditar && (
          <Button variant="outline" size="sm" onClick={abrirEdicion}>
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </Button>
        )}
        {puedeCerrar && (
          <Button size="sm" onClick={() => setCerrando(true)}>
            <CheckCircle2 className="size-3.5" aria-hidden />
            Cerrar ticket
          </Button>
        )}
        {puedeReabrir && (
          <Button size="sm" variant="secondary" onClick={() => setReabriendo(true)}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reabrir ticket
          </Button>
        )}
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {ticket.codigo}</DialogTitle>
            <DialogDescription>
              Cambia el asunto, la prioridad o los catálogos del ticket.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-asunto">Asunto</Label>
              <Input
                id="ticket-asunto"
                value={asunto}
                maxLength={150}
                onChange={evento => setAsunto(evento.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-prioridad">Prioridad</Label>
              <Select
                value={prioridad}
                onValueChange={valor => setPrioridad(valor as PrioridadTicket)}
              >
                <SelectTrigger id="ticket-prioridad" aria-label="Prioridad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES_TICKET.map(opcion => (
                    <SelectItem key={opcion} value={opcion}>
                      {ETIQUETAS_PRIORIDAD[opcion]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-categoria">Categoría</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger id="ticket-categoria" aria-label="Categoría">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-area">Área</Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger id="ticket-area" aria-label="Área">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_AREA}>Sin área</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditando(false)}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={reabriendo} onOpenChange={setReabriendo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabrir el ticket {ticket.codigo}</DialogTitle>
            <DialogDescription>
              El ticket volverá a estar activo. Se avisará al creador y al Soporte asignado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReabriendo(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button onClick={reabrir} disabled={enviando}>
              {enviando ? "Reabriendo..." : "Sí, reabrir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cerrando} onOpenChange={setCerrando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar el ticket {ticket.codigo}</DialogTitle>
            <DialogDescription>
              El ticket quedará cerrado y no admitirá mensajes nuevos. Avisaremos al creador y al
              Soporte asignado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCerrando(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button onClick={cerrar} disabled={enviando}>
              {enviando ? "Cerrando..." : "Sí, cerrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
