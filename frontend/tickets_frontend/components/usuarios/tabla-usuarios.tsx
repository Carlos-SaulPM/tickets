"use client";

import { useState } from "react";

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
import type { Usuario } from "@/types/usuario.types";

const TODOS = "todos";
const POR_PAGINA = 10;

interface TablaUsuariosProps {
  usuarios: Usuario[];
  alEditar: (usuario: Usuario) => void;
  alEliminar: (usuario: Usuario) => void;
  alReactivar: (usuario: Usuario) => void;
  alCrear: () => void;
}

const nombreCompleto = (usuario: Usuario) =>
  `${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`.trim();

export function TablaUsuarios({
  usuarios,
  alEditar,
  alEliminar,
  alReactivar,
  alCrear,
}: TablaUsuariosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(TODOS);
  const [pagina, setPagina] = useState(1);

  const usuariosFiltrados = usuarios.filter(usuario => {
    const texto = busqueda.toLowerCase();

    return (
      (usuario.nombre.toLowerCase().includes(texto) ||
        usuario.correo_electronico.toLowerCase().includes(texto)) &&
      (filtroEstado === TODOS || usuario.estado === filtroEstado)
    );
  });

  const totalPaginas = Math.ceil(usuariosFiltrados.length / POR_PAGINA) || 1;
  const visibles = usuariosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const acciones = (usuario: Usuario) => (
    <>
      <Button size="sm" variant="outline" onClick={() => alEditar(usuario)}>
        Editar
      </Button>
      {usuario.estado === "Baja" ? (
        <Button size="sm" variant="secondary" onClick={() => alReactivar(usuario)}>
          Reactivar
        </Button>
      ) : (
        <Button size="sm" variant="destructive" onClick={() => alEliminar(usuario)}>
          Dar de baja
        </Button>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full gap-1.5 sm:max-w-sm">
          <Label htmlFor="buscar-usuarios">Buscar</Label>
          <Input
            id="buscar-usuarios"
            placeholder="Nombre o correo"
            value={busqueda}
            onChange={evento => {
              setBusqueda(evento.target.value);
              setPagina(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="filtro-estado-usuarios">Estado</Label>
            <Select
              value={filtroEstado}
              onValueChange={valor => {
                setFiltroEstado(valor);
                setPagina(1);
              }}
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

      {visibles.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed px-6 py-12 text-center text-sm">
          No se encontraron usuarios.
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="divide-y md:hidden">
            {visibles.map(usuario => (
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
                {visibles.map(usuario => (
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
          Página {pagina} de {totalPaginas} · {usuariosFiltrados.length} usuarios
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
