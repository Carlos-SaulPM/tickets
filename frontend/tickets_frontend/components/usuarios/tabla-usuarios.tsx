"use client";

import type { FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MetaUsuarios, Usuario } from "@/types/usuario.types";

const TODOS = "todos";

export interface FiltrosTablaUsuarios {
  buscar: string;
  estado: string;
}

export interface CambiosFiltrosUsuarios {
  buscar?: string;
  estado?: string;
  pagina?: number;
}

interface TablaUsuariosProps {
  usuarios: Usuario[];
  meta: MetaUsuarios;
  filtros: FiltrosTablaUsuarios;
  alNavegar: (cambios: CambiosFiltrosUsuarios) => void;
  alEditar: (usuario: Usuario) => void;
  alRestablecer: (usuario: Usuario) => void;
  alEliminar: (usuario: Usuario) => void;
  alReactivar: (usuario: Usuario) => void;
  alCrear: () => void;
}

const nombreCompleto = (usuario: Usuario) =>
  `${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`.trim();

export function TablaUsuarios({
  usuarios,
  meta,
  filtros,
  alNavegar,
  alEditar,
  alRestablecer,
  alEliminar,
  alReactivar,
  alCrear,
}: TablaUsuariosProps) {
  const buscar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const datos = new FormData(evento.currentTarget);

    alNavegar({ buscar: String(datos.get("buscar") ?? "").trim(), pagina: 1 });
  };

  const acciones = (usuario: Usuario) => (
    <>
      {usuario.estado !== "Baja" && (
        <Button size="sm" variant="outline" onClick={() => alEditar(usuario)}>
          Editar
        </Button>
      )}
      {usuario.estado === "Baja" ? (
        <Button size="sm" variant="secondary" onClick={() => alReactivar(usuario)}>
          Reactivar
        </Button>
      ) : (
        <>
          <Button size="sm" variant="secondary" onClick={() => alRestablecer(usuario)}>
            Contraseña
          </Button>
          <Button size="sm" variant="destructive" onClick={() => alEliminar(usuario)}>
            Dar de baja
          </Button>
        </>
      )}
    </>
  );

  const totalPaginas = Math.max(1, meta.total_paginas);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form onSubmit={buscar} className="flex w-full items-end gap-2 sm:max-w-sm">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="buscar-usuarios">Buscar</Label>
            <Input
              id="buscar-usuarios"
              name="buscar"
              placeholder="Nombre o correo"
              defaultValue={filtros.buscar}
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>

        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="filtro-estado-usuarios">Estado</Label>
            <Select
              value={filtros.estado}
              onValueChange={valor => alNavegar({ estado: valor, pagina: 1 })}
            >
              <SelectTrigger id="filtro-estado-usuarios" aria-label="Estado" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={alCrear}>Nuevo usuario</Button>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed px-6 py-12 text-center text-sm">
          No se encontraron usuarios.
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="divide-y md:hidden">
            {usuarios.map(usuario => (
              <div key={usuario.id} className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{nombreCompleto(usuario)}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {usuario.correo_electronico}
                    </p>
                  </div>
                  <Badge variant={usuario.estado === "Activo" ? "secondary" : "outline"}>
                    {usuario.estado}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs">{usuario.rol.nombre}</span>
                  <div className="ml-auto flex gap-2">{acciones(usuario)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden lg:table-cell">Correo</TableHead>
                  <TableHead className="hidden lg:table-cell">Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map(usuario => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{nombreCompleto(usuario)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {usuario.correo_electronico}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{usuario.rol.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.estado === "Activo" ? "secondary" : "outline"}>
                        {usuario.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">{acciones(usuario)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>
          Página {meta.pagina} de {totalPaginas} · {meta.total} usuarios
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={meta.pagina <= 1}
            onClick={() => alNavegar({ pagina: meta.pagina - 1 })}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={meta.pagina >= totalPaginas}
            onClick={() => alNavegar({ pagina: meta.pagina + 1 })}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
