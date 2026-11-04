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
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { ticketsService } from "@/services/tickets.service";

type Accion = "aprobar" | "rechazar";

const TEXTOS = {
  aprobar: {
    titulo: "Aprobar solución",
    descripcion: "El ticket pasará a Resuelto y se avisará al soporte.",
    boton: "Sí, aprobar",
    exito: "Solución aprobada",
  },
  rechazar: {
    titulo: "Rechazar solución",
    descripcion: "El ticket volverá a En proceso y se avisará al soporte.",
    boton: "Sí, rechazar",
    exito: "Solución rechazada",
  },
} as const;

export function AccionesPropuesta({ ticketId, codigo }: { ticketId: string; codigo: string }) {
  const router = useRouter();
  const [accion, setAccion] = useState<Accion | null>(null);
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    if (!accion) return;

    setEnviando(true);

    try {
      if (accion === "aprobar") {
        await ticketsService.aprobar(ticketId);
      } else {
        await ticketsService.rechazar(ticketId);
      }

      toast.success(TEXTOS[accion].exito);
      setAccion(null);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        router.replace("/login");
        return;
      }

      toast.error(error instanceof Error ? error.message : "No se pudo completar la acción");
    } finally {
      setEnviando(false);
    }
  };

  const texto = accion ? TEXTOS[accion] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setAccion("aprobar")}>Aprobar solución</Button>
        <Button variant="outline" onClick={() => setAccion("rechazar")}>
          Rechazar
        </Button>
      </div>

      <Dialog open={accion !== null} onOpenChange={abierto => !abierto && setAccion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texto?.titulo}</DialogTitle>
            <DialogDescription>
              {texto?.descripcion} Ticket {codigo}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccion(null)} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              variant={accion === "rechazar" ? "destructive" : "default"}
              onClick={confirmar}
              disabled={enviando}
            >
              {enviando ? "Procesando..." : texto?.boton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
