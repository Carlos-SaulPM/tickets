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
import type {
  ColaTickets,
  ConsultaTickets,
  EstadoTicket,
  OrdenTickets,
  PrioridadTicket,
} from "@/types/ticket.types";

const TODOS = "todos";

const COLAS: { valor: ColaTickets; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "sin_asignar", etiqueta: "Sin asignar" },
  { valor: "mios", etiqueta: "Míos" },
];

const ORDENES: { valor: OrdenTickets; etiqueta: string }[] = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "actualizados", etiqueta: "Actualizados" },
  { valor: "prioridad", etiqueta: "Prioridad" },
];

export function FiltrosTickets({
  filtros,
  mostrarCola,
}: {
  filtros: ConsultaTickets;
  mostrarCola: boolean;
}) {
  const router = useRouter();

  const [estado, setEstado] = useState<EstadoTicket | typeof TODOS>(filtros.estado ?? TODOS);
  const [prioridad, setPrioridad] = useState<PrioridadTicket | typeof TODOS>(
    filtros.prioridad ?? TODOS
  );
  const [buscar, setBuscar] = useState(filtros.buscar ?? "");
  const [cola, setCola] = useState<ColaTickets>(filtros.asignado ?? "todos");
  const [orden, setOrden] = useState<OrdenTickets>(filtros.orden ?? "recientes");

  const navegar = (extra: Partial<ConsultaTickets> = {}) => {
    const query = construirConsultaTickets({
      estado: estado === TODOS ? undefined : estado,
      prioridad: prioridad === TODOS ? undefined : prioridad,
      buscar: buscar.trim() || undefined,
      asignado: cola === "todos" ? undefined : cola,
      orden: orden === "recientes" ? undefined : orden,
      ...extra,
    });

    router.push(query ? `/tickets?${query}` : "/tickets");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navegar();
  };

  const handleReset = () => {
    setEstado(TODOS);
    setPrioridad(TODOS);
    setBuscar("");
    setCola("todos");
    setOrden("recientes");
    router.push("/tickets");
  };

  const cambiarCola = (valor: ColaTickets) => {
    setCola(valor);
    navegar({ asignado: valor === "todos" ? undefined : valor });
  };

  const cambiarOrden = (valor: OrdenTickets) => {
    setOrden(valor);
    navegar({ orden: valor === "recientes" ? undefined : valor });
  };

  return (
    <div className="space-y-3">
      {mostrarCola && (
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs">Cola</span>
            <div role="group" aria-label="Cola de tickets" className="flex gap-1">
              {COLAS.map(opcion => (
                <Button
                  key={opcion.valor}
                  type="button"
                  size="sm"
                  variant={cola === opcion.valor ? "default" : "outline"}
                  aria-pressed={cola === opcion.valor}
                  onClick={() => cambiarCola(opcion.valor)}
                >
                  {opcion.etiqueta}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="orden" className="text-xs">
              Orden
            </Label>
            <Select value={orden} onValueChange={valor => cambiarOrden(valor as OrdenTickets)}>
              <SelectTrigger id="orden" aria-label="Ordenar por" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDENES.map(opcion => (
                  <SelectItem key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="grid w-full gap-1.5 sm:w-auto">
          <Label htmlFor="buscar">Buscar</Label>
          <Input
            id="buscar"
            value={buscar}
            onChange={event => setBuscar(event.target.value)}
            placeholder="Código, asunto o descripción"
            className="w-full sm:w-64"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select value={estado} onValueChange={valor => setEstado(valor as typeof estado)}>
            <SelectTrigger id="estado" aria-label="Estado" className="w-40">
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
          <Label htmlFor="prioridad">Prioridad</Label>
          <Select
            value={prioridad}
            onValueChange={valor => setPrioridad(valor as typeof prioridad)}
          >
            <SelectTrigger id="prioridad" aria-label="Prioridad" className="w-40">
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
    </div>
  );
}
