"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import type { Usuario } from "@/types/usuario.types";

interface AccionesAsignacionProps {
  ticketId: string;
  codigo: string;
  asignadoId: string | null;
  usuarioId: string;
  esAdmin: boolean;
  esSoporte: boolean;
  asignable: boolean;
  soportes: Usuario[];
}

export function AccionesAsignacion({
  ticketId,
  codigo,
  asignadoId,
  usuarioId,
  esAdmin,
  esSoporte,
  asignable,
  soportes,
}: AccionesAsignacionProps) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [seleccionado, setSeleccionado] = useState(asignadoId ?? soportes[0]?.id ?? "");
  const [enviando, setEnviando] = useState(false);

  const asignar = async (asignado_a_id: string) => {
    setEnviando(true);

    try {
      await ticketsService.asignar(ticketId, asignado_a_id);
      toast.success("Ticket asignado");
      setConfirmando(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        router.replace("/login");
        return;
      }

      toast.error(error instanceof Error ? error.message : "No se pudo asignar el ticket");
    } finally {
      setEnviando(false);
    }
  };

  if (esSoporte) {
    if (asignadoId === usuarioId) {
      return <p className="text-muted-foreground text-xs">Atiendes este ticket.</p>;
    }

    if (asignadoId) return null;

    if (!asignable) return null;

    return (
      <>
        <Button size="sm" onClick={() => setConfirmando(true)}>
          Tomar ticket
        </Button>

        <Dialog open={confirmando} onOpenChange={setConfirmando}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tomar el ticket {codigo}</DialogTitle>
              <DialogDescription>
                Pasará a En proceso y quedará asignado a tu nombre.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmando(false)} disabled={enviando}>
                Cancelar
              </Button>
              <Button onClick={() => asignar(usuarioId)} disabled={enviando}>
                {enviando ? "Tomando..." : "Sí, tomar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!esAdmin || !asignable) return null;

  if (soportes.length === 0) {
    return <p className="text-muted-foreground text-xs">No hay usuarios de Soporte activos.</p>;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="soporte-asignado" className="text-xs">
        Asignar a
      </Label>

      <Select value={seleccionado} onValueChange={setSeleccionado}>
        <SelectTrigger id="soporte-asignado" aria-label="Soporte asignado" className="w-full">
          <SelectValue placeholder="Selecciona un soporte" />
        </SelectTrigger>
        <SelectContent>
          {soportes.map(soporte => (
            <SelectItem key={soporte.id} value={soporte.id}>
              {soporte.nombre} {soporte.apellido_paterno}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="sm"
        className="w-full"
        disabled={!seleccionado || enviando}
        onClick={() => asignar(seleccionado)}
      >
        {enviando ? "Asignando..." : asignadoId ? "Reasignar" : "Asignar"}
      </Button>
    </div>
  );
}
