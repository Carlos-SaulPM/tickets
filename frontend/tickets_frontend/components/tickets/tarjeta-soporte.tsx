import { Mail, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatearFecha } from "@/lib/fechas";
import type { TicketUsuario } from "@/types/ticket.types";

const iniciales = (usuario: TicketUsuario) =>
  `${usuario.nombre[0] ?? ""}${usuario.apellido_paterno[0] ?? ""}`.toUpperCase();

interface TarjetaSoporteProps {
  asignado: TicketUsuario | null;
  desde: string | null;
  children?: React.ReactNode;
}

export function TarjetaSoporte({ asignado, desde, children }: TarjetaSoporteProps) {
  if (!asignado) {
    return (
      <aside aria-labelledby="soporte-titulo" className="bg-card rounded-lg border p-4">
        <h2 id="soporte-titulo" className="mb-2 text-sm font-semibold">
          Soporte asignado
        </h2>
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden />
          Aún sin asignar. Soporte lo tomará en cuanto lo revise.
        </p>
        {children && <div className="mt-3 border-t pt-3">{children}</div>}
      </aside>
    );
  }

  return (
    <aside aria-labelledby="soporte-titulo" className="bg-card rounded-lg border p-4">
      <h2 id="soporte-titulo" className="mb-3 text-sm font-semibold">
        Soporte asignado
      </h2>

      <div className="flex items-center gap-3">
        <span
          className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          aria-hidden
        >
          {iniciales(asignado)}
        </span>

        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium">
            {asignado.nombre} {asignado.apellido_paterno}
          </p>
          <Badge variant="secondary">Soporte</Badge>
        </div>
      </div>

      <a
        href={`mailto:${asignado.correo_electronico}`}
        className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-2 text-xs break-all underline-offset-2 hover:underline"
      >
        <Mail className="size-3.5 shrink-0" aria-hidden />
        {asignado.correo_electronico}
      </a>

      <p className="text-muted-foreground mt-2 text-xs">
        {desde ? `Atiende desde ${formatearFecha(desde)}` : "Asignación sin fecha registrada"}
      </p>

      {children && <div className="mt-3 border-t pt-3">{children}</div>}
    </aside>
  );
}
