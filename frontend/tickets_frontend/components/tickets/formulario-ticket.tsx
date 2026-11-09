"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createTicketSchema, type ValoresFormularioTicket } from "@/schemas/ticket.schema";
import { authService } from "@/services/auth.service";
import { ticketsService } from "@/services/tickets.service";
import type { Area, Categoria } from "@/types/catalogo.types";
import {
  ETIQUETAS_PRIORIDAD,
  PRIORIDADES_TICKET,
  type PrioridadTicket,
} from "@/types/ticket.types";

const SIN_AREA = "sin-area";
const BORRADOR_KEY = "tickets.borrador-nuevo";

const VALORES_VACIOS: ValoresFormularioTicket = {
  asunto: "",
  descripcion: "",
  categoria_id: "",
  area_id: SIN_AREA,
  prioridad: "Media",
};

export function FormularioTicket({
  categorias,
  areas,
}: {
  categorias: Categoria[];
  areas: Area[];
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ValoresFormularioTicket>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: VALORES_VACIOS,
  });

  const valores = useWatch({ control });
  const categoriaId = useWatch({ control, name: "categoria_id" });
  const areaId = useWatch({ control, name: "area_id" });
  const prioridad = useWatch({ control, name: "prioridad" });

  const hayCambios = Boolean(
    valores.asunto?.trim() || valores.descripcion?.trim() || valores.categoria_id
  );

  const [confirmarSalida, setConfirmarSalida] = useState(false);

  useEffect(() => {
    const guardado = sessionStorage.getItem(BORRADOR_KEY);
    if (!guardado) return;

    try {
      reset({ ...VALORES_VACIOS, ...(JSON.parse(guardado) as Partial<ValoresFormularioTicket>) });
    } catch {
      sessionStorage.removeItem(BORRADOR_KEY);
    }
  }, [reset]);

  useEffect(() => {
    if (!hayCambios) {
      sessionStorage.removeItem(BORRADOR_KEY);
      return;
    }

    sessionStorage.setItem(BORRADOR_KEY, JSON.stringify(valores));
  }, [hayCambios, valores]);

  const handleFormSubmit = async (data: ValoresFormularioTicket) => {
    try {
      const ticket = await ticketsService.crear({
        asunto: data.asunto,
        descripcion: data.descripcion,
        categoria_id: data.categoria_id,
        prioridad: data.prioridad,
        area_id: data.area_id === SIN_AREA ? undefined : data.area_id,
      });

      sessionStorage.removeItem(BORRADOR_KEY);
      toast.success(`Ticket ${ticket.codigo} creado`);
      reset(VALORES_VACIOS);
      router.push(`/tickets/${ticket.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        router.replace("/login?motivo=expirada");
        return;
      }

      toast.error(error instanceof Error ? error.message : "No se pudo crear el ticket");
    }
  };

  const cancelar = () => {
    if (hayCambios) {
      setConfirmarSalida(true);
      return;
    }

    router.push("/tickets");
  };

  const descartar = () => {
    sessionStorage.removeItem(BORRADOR_KEY);
    reset(VALORES_VACIOS);
    router.push("/tickets");
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="grid max-w-2xl gap-6">
        <p className="text-muted-foreground text-xs">Los campos marcados con * son obligatorios.</p>

        <div className="grid gap-1.5">
          <Label htmlFor="asunto">
            Asunto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="asunto"
            placeholder="Resumen breve del problema"
            required
            aria-invalid={errors.asunto ? true : undefined}
            aria-describedby={errors.asunto ? "error-asunto" : undefined}
            {...register("asunto")}
          />
          {errors.asunto && (
            <p id="error-asunto" className="text-destructive text-sm">
              {errors.asunto.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="descripcion"
            rows={6}
            placeholder="¿Qué ocurre y desde cuándo?"
            required
            aria-invalid={errors.descripcion ? true : undefined}
            aria-describedby={errors.descripcion ? "error-descripcion" : undefined}
            {...register("descripcion")}
          />
          {errors.descripcion && (
            <p id="error-descripcion" className="text-destructive text-sm">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="categoria">
              Categoría <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoriaId}
              onValueChange={valor => setValue("categoria_id", valor, { shouldValidate: true })}
            >
              <SelectTrigger
                id="categoria"
                aria-label="Categoría"
                aria-invalid={errors.categoria_id ? true : undefined}
                aria-describedby={errors.categoria_id ? "error-categoria" : undefined}
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && (
              <p id="error-categoria" className="text-destructive text-sm">
                {errors.categoria_id.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="area">Área (opcional)</Label>
            <Select value={areaId} onValueChange={valor => setValue("area_id", valor)}>
              <SelectTrigger id="area" aria-label="Área">
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

          <div className="grid gap-1.5">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              value={prioridad}
              onValueChange={valor => setValue("prioridad", valor as PrioridadTicket)}
            >
              <SelectTrigger id="prioridad" aria-label="Prioridad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDADES_TICKET.map(valor => (
                  <SelectItem key={valor} value={valor}>
                    {ETIQUETAS_PRIORIDAD[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear ticket"}
          </Button>
          <Button type="button" variant="ghost" onClick={cancelar}>
            Cancelar
          </Button>
        </div>
      </form>

      <Dialog open={confirmarSalida} onOpenChange={setConfirmarSalida}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar el borrador?</DialogTitle>
            <DialogDescription>
              Perderás lo que llevas escrito. El borrador se guarda mientras no salgas de esta
              pantalla.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmarSalida(false)}>
              Seguir editando
            </Button>
            <Button variant="destructive" onClick={descartar}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
