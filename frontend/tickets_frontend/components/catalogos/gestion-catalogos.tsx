"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ModalCatalogo, type DatosCatalogo } from "@/components/catalogos/modal-catalogo";
import { Badge } from "@/components/ui/badge";
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
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { catalogosService } from "@/services/catalogos.service";
import type { Area, Categoria } from "@/types/catalogo.types";

const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

type Pestana = "areas" | "categorias";

interface PorEliminar {
  tipo: Pestana;
  item: Area | Categoria;
}

const esCategoria = (item: Area | Categoria): item is Categoria => "descripcion" in item;

export function GestionCatalogos({
  areas,
  categorias,
}: {
  areas: Area[];
  categorias: Categoria[];
}) {
  const router = useRouter();

  const [pestana, setPestana] = useState<Pestana>("areas");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Area | Categoria | null>(null);
  const [porEliminar, setPorEliminar] = useState<PorEliminar | null>(null);
  const [procesando, setProcesando] = useState(false);

  const manejarError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      authService.logout();
      router.replace("/login?motivo=expirada");
      return;
    }

    toast.error(mensajeDeError(error));
  };

  const abrirCreacion = () => {
    setEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (item: Area | Categoria) => {
    setEditando(item);
    setModalAbierto(true);
  };

  const guardar = async (datos: DatosCatalogo) => {
    const esArea = pestana === "areas";

    try {
      if (esArea) {
        if (editando) {
          await catalogosService.actualizarArea(editando.id, {
            nombre: datos.nombre,
            activo: datos.activo,
          });
          toast.success("Área actualizada");
        } else {
          await catalogosService.crearArea({
            nombre: datos.nombre,
            activo: datos.activo,
          });
          toast.success("Área creada");
        }
      } else if (editando) {
        await catalogosService.actualizarCategoria(editando.id, {
          nombre: datos.nombre,
          descripcion: datos.descripcion ?? null,
          activo: datos.activo,
        });
        toast.success("Categoría actualizada");
      } else {
        await catalogosService.crearCategoria({
          nombre: datos.nombre,
          descripcion: datos.descripcion ?? null,
          activo: datos.activo,
        });
        toast.success("Categoría creada");
      }

      setModalAbierto(false);
      router.refresh();
    } catch (error) {
      manejarError(error);
    }
  };

  const alternarActivo = async (item: Area | Categoria) => {
    setProcesando(true);

    try {
      if (esCategoria(item)) {
        await catalogosService.actualizarCategoria(item.id, { activo: !item.activo });
        toast.success(item.activo ? "Categoría desactivada" : "Categoría activada");
      } else {
        await catalogosService.actualizarArea(item.id, { activo: !item.activo });
        toast.success(item.activo ? "Área desactivada" : "Área activada");
      }

      router.refresh();
    } catch (error) {
      manejarError(error);
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!porEliminar) return;

    setProcesando(true);

    try {
      if (porEliminar.tipo === "areas") {
        await catalogosService.eliminarArea(porEliminar.item.id);
        toast.success("Área eliminada");
      } else {
        await catalogosService.eliminarCategoria(porEliminar.item.id);
        toast.success("Categoría eliminada");
      }

      setPorEliminar(null);
      router.refresh();
    } catch (error) {
      manejarError(error);
      setPorEliminar(null);
    } finally {
      setProcesando(false);
    }
  };

  const lista = pestana === "areas" ? areas : categorias;
  const filtrados = lista.filter(item =>
    `${item.nombre} ${"descripcion" in item ? (item.descripcion ?? "") : ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div
            role="tablist"
            aria-label="Tipo de catálogo"
            className="inline-flex rounded-md border p-0.5"
          >
            {(["areas", "categorias"] as const).map(valor => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={pestana === valor}
                onClick={() => {
                  setPestana(valor);
                  setBusqueda("");
                }}
                className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                  pestana === valor
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {valor === "areas" ? "Áreas" : "Categorías"}
              </button>
            ))}
          </div>

          <div className="grid w-full gap-1.5 sm:max-w-xs">
            <label htmlFor="buscar-catalogo" className="text-sm font-medium">
              Buscar
            </label>
            <Input
              id="buscar-catalogo"
              placeholder="Nombre"
              value={busqueda}
              onChange={evento => setBusqueda(evento.target.value)}
            />
          </div>
        </div>

        <Button onClick={abrirCreacion}>
          <Plus className="size-4" aria-hidden />
          {pestana === "areas" ? "Nueva área" : "Nueva categoría"}
        </Button>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed px-6 py-12 text-center text-sm">
          {busqueda
            ? "No se encontraron resultados."
            : `Todavía no hay ${pestana === "areas" ? "áreas" : "categorías"}.`}
        </div>
      ) : (
        <div className="divide-y rounded-md border">
          {filtrados.map(item => (
            <div
              key={item.id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{item.nombre}</p>
                  <Badge variant={item.activo ? "secondary" : "outline"}>
                    {item.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {esCategoria(item) && item.descripcion && (
                  <p className="text-muted-foreground text-xs">{item.descripcion}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => abrirEdicion(item)}>
                  <Pencil className="size-3.5" aria-hidden />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={procesando}
                  onClick={() => alternarActivo(item)}
                >
                  {item.activo ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setPorEliminar({ tipo: pestana, item })}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalCatalogo
        key={`${pestana}-${editando?.id ?? "nuevo"}-${modalAbierto}`}
        abierto={modalAbierto}
        tipo={pestana === "areas" ? "area" : "categoria"}
        inicial={editando}
        alCerrar={() => setModalAbierto(false)}
        alGuardar={guardar}
      />

      <Dialog
        open={porEliminar !== null}
        onOpenChange={abierto => !abierto && setPorEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {porEliminar?.item.nombre}</DialogTitle>
            <DialogDescription>
              La eliminación es permanente. Si el registro tiene tickets asociados, el sistema la
              rechazará y conviene desactivarlo en su lugar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPorEliminar(null)} disabled={procesando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminar} disabled={procesando}>
              {procesando ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
