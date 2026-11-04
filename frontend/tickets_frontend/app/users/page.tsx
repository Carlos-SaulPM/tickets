"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
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
import { ModalUsuario } from "@/components/usuarios/modal-usuario";
import { TablaUsuarios } from "@/components/usuarios/tabla-usuarios";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { obtenerSesion } from "@/lib/sesion";
import { authService } from "@/services/auth.service";
import { rolesService } from "@/services/roles.service";
import { usuariosService } from "@/services/usuarios.service";
import type { Rol } from "@/types/rol.types";
import type { ActualizarUsuarioInput, CrearUsuarioInput, Usuario } from "@/types/usuario.types";

interface CreatedCredentials {
  correo_electronico: string;
  contrasena: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

export default function UsersPage() {
  const router = useRouter();
  const { sesion, isClient } = useAuth();

  const [users, setUsers] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);

  const isAdmin = sesion?.usuario.rol === "Administrador";

  useEffect(() => {
    if (isClient && !obtenerSesion()) {
      router.replace("/login");
    }
  }, [isClient, sesion, router]);

  useEffect(() => {
    if (!isClient || !isAdmin) return;

    let cancelled = false;

    Promise.all([usuariosService.listar(), rolesService.listar()])
      .then(([usersData, rolesData]) => {
        if (!cancelled) {
          setUsers(usersData);
          setRoles(rolesData);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          authService.logout();
          router.replace("/login");
          return;
        }

        toast.error(getErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, isClient, router]);

  const handleApiError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      authService.logout();
      router.replace("/login");
      return;
    }

    toast.error(getErrorMessage(error));
  };

  const loadUsers = async () => {
    try {
      const data = await usuariosService.listar();
      setUsers(data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: CrearUsuarioInput) => {
    try {
      if (selectedUser) {
        const changes: ActualizarUsuarioInput = {
          nombre: formData.nombre,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno,
        };

        if (formData.rol_id !== selectedUser.rol.id) {
          changes.rol_id = formData.rol_id;
        }

        await usuariosService.actualizar(selectedUser.id, changes);
        toast.success("Usuario actualizado correctamente");
      } else {
        const created = await usuariosService.crear(formData);
        setCreatedCredentials({
          correo_electronico: created.correo_electronico,
          contrasena: created.contrasena,
        });
        toast.success("Usuario creado correctamente");
      }

      await loadUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usuariosService.eliminar(id);
      toast.success("Usuario dado de baja correctamente");
      await loadUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (!isClient || !sesion) {
    return (
      <div className="text-muted-foreground p-8 text-sm">Redirigiendo al inicio de sesión...</div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main id="contenido" className="container mx-auto px-4 py-8">
          <h1 className="mb-2 text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main id="contenido" className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Gestión de Usuarios</h1>
        <TablaUsuarios
          users={users}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onOpenCreate={handleOpenCreate}
        />
        <ModalUsuario
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedUser}
          roles={roles}
        />

        <Dialog
          open={createdCredentials !== null}
          onOpenChange={open => {
            if (!open) setCreatedCredentials(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credenciales del usuario</DialogTitle>
              <DialogDescription>
                Comparte esta contraseña temporal con el usuario. No se volverá a mostrar.
              </DialogDescription>
            </DialogHeader>

            {createdCredentials && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Correo</Label>
                  <Input readOnly value={createdCredentials.correo_electronico} />
                </div>
                <div className="space-y-1">
                  <Label>Contraseña temporal</Label>
                  <Input readOnly value={createdCredentials.contrasena} />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setCreatedCredentials(null)}>Entendido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
