"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { construirConsultaTickets } from "@/lib/consulta-tickets";
import {
  ESTADOS_TICKET,
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
  PRIORIDADES_TICKET,
} from "@/types/ticket.types";
import type { ConsultaTickets, EstadoTicket, PrioridadTicket } from "@/types/ticket.types";

const TODOS = "todos";

export function FiltrosTickets({ filtros }: { filtros: ConsultaTickets }) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoTicket | typeof TODOS>(filtros.estado ?? TODOS);
  const [prioridad, setPrioridad] = useState<PrioridadTicket | typeof TODOS>(
    filtros.prioridad ?? TODOS
  );
  const [buscar, setBuscar] = useState(filtros.buscar ?? "");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const query = construirConsultaTickets({
      estado: estado === TODOS ? undefined : estado,
      prioridad: prioridad === TODOS ? undefined : prioridad,
      buscar: buscar.trim() || undefined,
    });

    router.push(query ? `/tickets?${query}` : "/tickets");
  };

  const handleReset = () => {
    setEstado(TODOS);
    setPrioridad(TODOS);
    setBuscar("");
    router.push("/tickets");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="buscar">Buscar</Label>
        <Input
          id="buscar"
          value={buscar}
          onChange={event => setBuscar(event.target.value)}
          placeholder="Código, asunto o descripción"
          className="w-64"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Estado</Label>
        <Select value={estado} onValueChange={valor => setEstado(valor as typeof estado)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos</SelectItem>
            {ESTADOS_TICKET.map(valor => (
              <SelectItem key={valor} value={valor}>
                {ETIQUETAS_ESTADO[valor]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label>Prioridad</Label>
        <Select value={prioridad} onValueChange={valor => setPrioridad(valor as typeof prioridad)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas</SelectItem>
            {PRIORIDADES_TICKET.map(valor => (
              <SelectItem key={valor} value={valor}>
                {ETIQUETAS_PRIORIDAD[valor]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Filtrar</Button>
      <Button type="button" variant="ghost" onClick={handleReset}>
        Limpiar
      </Button>
    </form>
  );
}
