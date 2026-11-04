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
import { Usuario } from "@/types/usuario.types";

interface TablaUsuariosProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (id: string) => void;
  onOpenCreate: () => void;
}

export function TablaUsuarios({ users, onEdit, onDelete, onOpenCreate }: TablaUsuariosProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(search.toLowerCase()) ||
      user.correo_electronico.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex max-w-sm flex-1 items-center gap-2">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={val => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Baja">Baja</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onOpenCreate}>Nuevo Usuario</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-6 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{`${user.nombre} ${user.apellido_paterno}`}</TableCell>
                  <TableCell>{user.correo_electronico}</TableCell>
                  <TableCell>{user.rol.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={user.estado === "Activo" ? "default" : "secondary"}>
                      {user.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={user.estado === "Baja"}
                      onClick={() => onDelete(user.id)}
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
          Página {page} de {totalPages}
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
