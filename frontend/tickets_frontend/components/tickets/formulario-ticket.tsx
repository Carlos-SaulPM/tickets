"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

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
    defaultValues: {
      asunto: "",
      descripcion: "",
      categoria_id: "",
      area_id: SIN_AREA,
      prioridad: "Media",
    },
  });

  const categoriaId = useWatch({ control, name: "categoria_id" });
  const areaId = useWatch({ control, name: "area_id" });
  const prioridad = useWatch({ control, name: "prioridad" });

  const handleFormSubmit = async (data: ValoresFormularioTicket) => {
    try {
      const ticket = await ticketsService.crear({
        asunto: data.asunto,
        descripcion: data.descripcion,
        categoria_id: data.categoria_id,
        prioridad: data.prioridad,
        area_id: data.area_id === SIN_AREA ? undefined : data.area_id,
      });

      toast.success(`Ticket ${ticket.codigo} creado`);
      reset();
      router.push(`/tickets/${ticket.id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        router.replace("/login");
        return;
      }

      toast.error(error instanceof Error ? error.message : "No se pudo crear el ticket");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid max-w-2xl gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="asunto">Asunto</Label>
        <Input
          id="asunto"
          placeholder="Resumen breve del problema"
          aria-invalid={Boolean(errors.asunto)}
          {...register("asunto")}
        />
        {errors.asunto && <p className="text-destructive text-sm">{errors.asunto.message}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          rows={6}
          placeholder="¿Qué ocurre y desde cuándo?"
          aria-invalid={Boolean(errors.descripcion)}
          {...register("descripcion")}
        />
        {errors.descripcion && (
          <p className="text-destructive text-sm">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label>Categoría</Label>
          <Select
            value={categoriaId}
            onValueChange={valor => setValue("categoria_id", valor, { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Categoría" aria-invalid={Boolean(errors.categoria_id)}>
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
            <p className="text-destructive text-sm">{errors.categoria_id.message}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label>Área</Label>
          <Select value={areaId} onValueChange={valor => setValue("area_id", valor)}>
            <SelectTrigger aria-label="Área">
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
          <Label>Prioridad</Label>
          <Select
            value={prioridad}
            onValueChange={valor => setValue("prioridad", valor as PrioridadTicket)}
          >
            <SelectTrigger aria-label="Prioridad">
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
        <Button type="button" variant="ghost" onClick={() => router.push("/tickets")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
