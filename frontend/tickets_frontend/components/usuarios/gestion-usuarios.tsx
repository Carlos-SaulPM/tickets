"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
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
import {
  TablaUsuarios,
  type CambiosFiltrosUsuarios,
  type FiltrosTablaUsuarios,
} from "@/components/usuarios/tabla-usuarios";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { usuariosService } from "@/services/usuarios.service";
import type { Rol } from "@/types/rol.types";
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  MetaUsuarios,
  Usuario,
} from "@/types/usuario.types";

const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : "Error inesperado";

const nombreCompleto = (usuario: Usuario) => `${usuario.nombre} ${usuario.apellido_paterno}`.trim();

interface Credenciales {
  correo_electronico: string;
  contrasena: string;
}

interface GestionUsuariosProps {
  usuarios: Usuario[];
  roles: Rol[];
  meta: MetaUsuarios;
  filtros: FiltrosTablaUsuarios;
}

export function GestionUsuarios({ usuarios, roles, meta, filtros }: GestionUsuariosProps) {
  const router = useRouter();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);
  const [porDarDeBaja, setPorDarDeBaja] = useState<Usuario | null>(null);
  const [procesando, setProcesando] = useState(false);

  const manejarError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      authService.logout();
      router.replace("/login?motivo=expirada");
      return;
    }

    toast.error(mensajeDeError(error));
  };

  const navegar = (cambios: CambiosFiltrosUsuarios) => {
    const params = new URLSearchParams();
    const buscar = cambios.buscar !== undefined ? cambios.buscar : filtros.buscar;
    const estado = cambios.estado !== undefined ? cambios.estado : filtros.estado;
    const pagina = cambios.pagina ?? 1;

    if (buscar) params.set("buscar", buscar);
    if (estado && estado !== "todos") params.set("estado", estado);
    if (pagina > 1) params.set("pagina", String(pagina));

    const consulta = params.toString();
    router.push(`/users${consulta ? `?${consulta}` : ""}`);
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
        toast.success("Usuario actualizado");
      } else {
        const creado = await usuariosService.crear(datos);

        setCredenciales({
          correo_electronico: creado.correo_electronico,
          contrasena: creado.contrasena,
        });
        toast.success("Usuario creado");
      }

      setModalAbierto(false);
      router.refresh();
    } catch (error) {
      manejarError(error);
    }
  };

  const confirmarBaja = async () => {
    if (!porDarDeBaja) return;

    setProcesando(true);

    try {
      await usuariosService.eliminar(porDarDeBaja.id);
      toast.success("Usuario dado de baja");
      setPorDarDeBaja(null);
      router.refresh();
    } catch (error) {
      manejarError(error);
    } finally {
      setProcesando(false);
    }
  };

  const reactivar = async (usuario: Usuario) => {
    setProcesando(true);

    try {
      await usuariosService.actualizar(usuario.id, { estado: "Activo" });
      toast.success("Usuario reactivado");
      router.refresh();
    } catch (error) {
      manejarError(error);
    } finally {
      setProcesando(false);
    }
  };

  const restablecerContrasena = async (usuario: Usuario) => {
    setProcesando(true);

    try {
      const datos = await usuariosService.restablecerContrasena(usuario.id);
      setCredenciales(datos);
      toast.success("Contraseña restablecida");
    } catch (error) {
      manejarError(error);
    } finally {
      setProcesando(false);
    }
  };

  const copiar = async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(`${etiqueta} copiado`);
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto manualmente.");
    }
  };

  return (
    <>
      <TablaUsuarios
        usuarios={usuarios}
        meta={meta}
        filtros={filtros}
        alNavegar={navegar}
        alEditar={abrirEdicion}
        alEliminar={setPorDarDeBaja}
        alReactivar={reactivar}
        alRestablecer={restablecerContrasena}
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
        open={porDarDeBaja !== null}
        onOpenChange={abierto => !abierto && setPorDarDeBaja(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Dar de baja a {porDarDeBaja ? nombreCompleto(porDarDeBaja) : ""}
            </DialogTitle>
            <DialogDescription>
              Dejará de poder iniciar sesión. Puedes reactivarlo después desde la misma tabla.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPorDarDeBaja(null)} disabled={procesando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarBaja} disabled={procesando}>
              {procesando ? "Dando de baja..." : "Sí, dar de baja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="credencial-correo">Correo</Label>
                <div className="flex gap-2">
                  <Input id="credencial-correo" readOnly value={credenciales.correo_electronico} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copiar correo"
                    onClick={() => copiar(credenciales.correo_electronico, "Correo")}
                  >
                    <Copy className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="credencial-contrasena">Contraseña temporal</Label>
                <div className="flex gap-2">
                  <Input id="credencial-contrasena" readOnly value={credenciales.contrasena} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copiar contraseña"
                    onClick={() => copiar(credenciales.contrasena, "Contraseña")}
                  >
                    <Copy className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() =>
                  copiar(
                    `Correo: ${credenciales.correo_electronico}\nContraseña: ${credenciales.contrasena}`,
                    "Credenciales"
                  )
                }
              >
                Copiar ambas
              </Button>
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
