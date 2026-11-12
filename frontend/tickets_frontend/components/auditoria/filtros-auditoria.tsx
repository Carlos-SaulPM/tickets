"use client";

import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntidadAuditoria } from "@/types/auditoria.types";

const TODAS = "todas";

const ENTIDADES: Array<{ valor: EntidadAuditoria; etiqueta: string }> = [
  { valor: "USUARIO", etiqueta: "Usuarios" },
  { valor: "AREA", etiqueta: "Áreas" },
  { valor: "CATEGORIA", etiqueta: "Categorías" },
  { valor: "TICKET", etiqueta: "Tickets" },
];

export function FiltrosAuditoria({ entidad }: { entidad: EntidadAuditoria | undefined }) {
  const router = useRouter();

  const cambiar = (valor: string) => {
    const consulta = valor === TODAS ? "" : `?entidad=${valor}`;
    router.push(`/auditoria${consulta}`);
  };

  return (
    <div className="grid w-full gap-1.5 sm:max-w-[200px]">
      <Label htmlFor="filtro-entidad-auditoria">Entidad</Label>
      <Select value={entidad ?? TODAS} onValueChange={cambiar}>
        <SelectTrigger id="filtro-entidad-auditoria" aria-label="Entidad">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Todas</SelectItem>
          {ENTIDADES.map(opcion => (
            <SelectItem key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
