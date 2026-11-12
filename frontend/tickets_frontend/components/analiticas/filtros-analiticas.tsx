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
import type { Area, Categoria } from "@/types/catalogo.types";

const TODAS = "todas";

interface Props {
  desde: string;
  hasta: string;
  areaId: string;
  categoriaId: string;
  asignadoId: string;
  areas: Area[];
  categorias: Categoria[];
  soportes: Array<{ id: string; nombre: string; apellido_paterno: string }>;
  mostrarSoportes: boolean;
}

export function FiltrosAnaliticas({
  desde,
  hasta,
  areaId,
  categoriaId,
  asignadoId,
  areas,
  categorias,
  soportes,
  mostrarSoportes,
}: Props) {
  const router = useRouter();

  const [area, setArea] = useState(areaId || TODAS);
  const [categoria, setCategoria] = useState(categoriaId || TODAS);
  const [asignado, setAsignado] = useState(asignadoId || TODAS);

  const aplicar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const datos = new FormData(evento.currentTarget);
    const params = new URLSearchParams();
    const fechaDesde = String(datos.get("desde") ?? "");
    const fechaHasta = String(datos.get("hasta") ?? "");

    if (fechaDesde) params.set("desde", fechaDesde);
    if (fechaHasta) params.set("hasta", fechaHasta);
    if (area !== TODAS) params.set("area_id", area);
    if (categoria !== TODAS) params.set("categoria_id", categoria);
    if (mostrarSoportes && asignado !== TODAS) params.set("asignado_a_id", asignado);

    const consulta = params.toString();
    router.push(`/analiticas${consulta ? `?${consulta}` : ""}`);
  };

  const limpiar = () => {
    setArea(TODAS);
    setCategoria(TODAS);
    setAsignado(TODAS);
    router.push("/analiticas");
  };

  return (
    <form onSubmit={aplicar} className="bg-card rounded-lg border p-4">
      <div
        className={`grid gap-3 sm:grid-cols-2 ${mostrarSoportes ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" name="desde" type="date" defaultValue={desde} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" name="hasta" type="date" defaultValue={hasta} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="area">Área</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger id="area" aria-label="Área" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas</SelectItem>
              {areas.map(opcion => (
                <SelectItem key={opcion.id} value={opcion.id}>
                  {opcion.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="categoria">Categoría</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria" aria-label="Categoría" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas</SelectItem>
              {categorias.map(opcion => (
                <SelectItem key={opcion.id} value={opcion.id}>
                  {opcion.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {mostrarSoportes && (
          <div className="grid gap-1.5">
            <Label htmlFor="soporte">Soporte</Label>
            <Select value={asignado} onValueChange={setAsignado}>
              <SelectTrigger id="soporte" aria-label="Soporte" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todos</SelectItem>
                {soportes.map(opcion => (
                  <SelectItem key={opcion.id} value={opcion.id}>
                    {opcion.nombre} {opcion.apellido_paterno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">Aplicar filtros</Button>
        <Button type="button" variant="ghost" onClick={limpiar}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
