"use client";

import { useState, type FormEvent } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import type { Area, Categoria } from "@/types/catalogo.types";

export interface DatosCatalogo {
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

interface ModalCatalogoProps {
  abierto: boolean;
  tipo: "area" | "categoria";
  inicial: Area | Categoria | null;
  alCerrar: () => void;
  alGuardar: (datos: DatosCatalogo) => Promise<void>;
}

export function ModalCatalogo({ abierto, tipo, inicial, alCerrar, alGuardar }: ModalCatalogoProps) {
  const esCategoria = tipo === "categoria";
  const esEdicion = Boolean(inicial);

  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(
    inicial && "descripcion" in inicial ? (inicial.descripcion ?? "") : ""
  );
  const [activo, setActivo] = useState(inicial?.activo ?? true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();

    const texto = nombre.trim();

    if (!texto) {
      setError("El nombre es obligatorio");
      return;
    }

    setGuardando(true);

    try {
      await alGuardar({
        nombre: texto,
        descripcion: esCategoria ? descripcion.trim() || null : null,
        activo,
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={abierto => !abierto && alCerrar()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? "Editar" : "Nueva"} {esCategoria ? "categoría" : "área"}
          </DialogTitle>
          <DialogDescription>
            {esCategoria
              ? "La categoría agrupa el tipo de incidencia del ticket."
              : "El área indica a qué parte de la organización pertenece el ticket."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="space-y-4 pt-2" noValidate>
          <div className="space-y-2">
            <Label htmlFor="catalogo-nombre">Nombre</Label>
            <Input
              id="catalogo-nombre"
              value={nombre}
              maxLength={50}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "error-catalogo-nombre" : undefined}
              onChange={evento => {
                setNombre(evento.target.value);
                setError("");
              }}
            />
            {error && (
              <p id="error-catalogo-nombre" className="text-destructive text-xs">
                {error}
              </p>
            )}
          </div>

          {esCategoria && (
            <div className="space-y-2">
              <Label htmlFor="catalogo-descripcion">Descripción</Label>
              <Textarea
                id="catalogo-descripcion"
                value={descripcion}
                rows={3}
                maxLength={200}
                onChange={evento => setDescripcion(evento.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="catalogo-activo"
              type="checkbox"
              className="size-4"
              checked={activo}
              onChange={evento => setActivo(evento.target.checked)}
            />
            <Label htmlFor="catalogo-activo">Disponible al crear tickets</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={alCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
