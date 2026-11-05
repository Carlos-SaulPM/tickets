import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const POR_PAGINA = 5;

interface TablaUsuariosProps {
  usuarios: Usuario[];
  alEditar: (usuario: Usuario) => void;
  alEliminar: (id: string) => void;
  alCrear: () => void;
}

export function TablaUsuarios({ usuarios, alEditar, alEliminar, alCrear }: TablaUsuariosProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex max-w-sm flex-1 items-center gap-2">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={evento => {
              setBusqueda(evento.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filtroEstado}
            onValueChange={valor => {
              setFiltroEstado(valor);
              setPagina(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Baja">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={alCrear}>Nuevo usuario</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-6 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              visibles.map(usuario => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">
                    {usuario.nombre} {usuario.apellido_paterno}
                  </TableCell>
                  <TableCell>{usuario.correo_electronico}</TableCell>
                  <TableCell>{usuario.rol.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.estado === "Activo" ? "default" : "secondary"}>
                      {usuario.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => alEditar(usuario)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={usuario.estado === "Baja"}
                      onClick={() => alEliminar(usuario.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          Página {pagina} de {totalPaginas}
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
