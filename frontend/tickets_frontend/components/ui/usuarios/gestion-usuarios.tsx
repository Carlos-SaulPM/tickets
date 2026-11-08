"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ModalUsuario } from "@/components/usuarios/modal-usuario";
import { TablaUsuarios } from "@/components/usuarios/tabla-usuarios";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { usuariosService } from "@/services/usuarios.service";
import type { Rol } from "@/types/rol.types";
import type { ActualizarUsuarioInput, CrearUsuarioInput, Usuario } from "@/types/usuario.types";

const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

interface Credenciales {
  correo_electronico: string;
  contrasena: string;
}

export function GestionUsuarios({ usuarios, roles }: { usuarios: Usuario[]; roles: Rol[] }) {
  const router = useRouter();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);

  const manejarError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      authService.logout();
      router.replace("/login");
      return;
    }

    toast.error(mensajeDeError(error));
  };

  const abrirCreacion = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const guardar = async (datos: CrearUsuarioInput) => {
    try {
      if (usuarioSeleccionado) {
        const cambios: ActualizarUsuarioInput = {
          nombre: datos.nombre,
          apellido_paterno: datos.apellido_paterno,
          apellido_materno: datos.apellido_materno,
        };

        if (datos.rol_id !== usuarioSeleccionado.rol.id) {
          cambios.rol_id = datos.rol_id;
        }

        await usuariosService.actualizar(usuarioSeleccionado.id, cambios);
        toast.success("Usuario actualizado correctamente");
      } else {
        const creado = await usuariosService.crear(datos);

        setCredenciales({
          correo_electronico: creado.correo_electronico,
          contrasena: creado.contrasena,
        });
        toast.success("Usuario creado correctamente");
      }

      setModalAbierto(false);
      router.refresh();
    } catch (error) {
      manejarError(error);
    }
  };

  const eliminar = async (id: string) => {
    try {
      await usuariosService.eliminar(id);
      toast.success("Usuario dado de baja correctamente");
      router.refresh();
    } catch (error) {
      manejarError(error);
    }
  };

  return (
    <>
      <TablaUsuarios
        usuarios={usuarios}
        alEditar={abrirEdicion}
        alEliminar={eliminar}
        alCrear={abrirCreacion}
      />

      <ModalUsuario
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alGuardar={guardar}
        usuarioInicial={usuarioSeleccionado}
        roles={roles}
      />

      <Dialog
        open={credenciales !== null}
        onOpenChange={abierto => {
          if (!abierto) setCredenciales(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credenciales del usuario</DialogTitle>
            <DialogDescription>
              Comparte esta contraseña temporal con el usuario. No se volverá a mostrar.
            </DialogDescription>
          </DialogHeader>

          {credenciales && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Correo</Label>
                <Input readOnly value={credenciales.correo_electronico} />
              </div>
              <div className="space-y-1">
                <Label>Contraseña temporal</Label>
                <Input readOnly value={credenciales.contrasena} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setCredenciales(null)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
