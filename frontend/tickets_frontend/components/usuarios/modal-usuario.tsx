"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crearUsuarioSchema } from "@/schemas/usuario.schema";
import type { Rol } from "@/types/rol.types";
import type { CrearUsuarioInput, Usuario } from "@/types/usuario.types";

interface ModalUsuarioProps {
  abierto: boolean;
  alCerrar: () => void;
  alGuardar: (datos: CrearUsuarioInput) => Promise<void>;
  usuarioInicial?: Usuario | null;
  roles: Rol[];
}

const VALORES_VACIOS: CrearUsuarioInput = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  correo_electronico: "",
  rol_id: "",
};

export function ModalUsuario({
  abierto,
  alCerrar,
  alGuardar,
  usuarioInicial,
  roles,
}: ModalUsuarioProps) {
  const esEdicion = Boolean(usuarioInicial);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrearUsuarioInput>({
    resolver: zodResolver(crearUsuarioSchema),
  });

  const rolesAsignables = roles.filter(
    rol => rol.nombre !== "Administrador" || usuarioInicial?.rol.nombre === "Administrador"
  );

  useEffect(() => {
    reset(
      usuarioInicial
        ? {
            nombre: usuarioInicial.nombre,
            apellido_paterno: usuarioInicial.apellido_paterno,
            apellido_materno: usuarioInicial.apellido_materno,
            correo_electronico: usuarioInicial.correo_electronico,
            rol_id: usuarioInicial.rol.id,
          }
        : VALORES_VACIOS
    );
  }, [usuarioInicial, reset, abierto]);

  return (
    <Dialog open={abierto} onOpenChange={alCerrar}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar usuario" : "Crear usuario"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualiza los datos del usuario. El correo no se puede cambiar."
              : "Se generará una contraseña temporal al guardar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(alGuardar)} className="space-y-4 pt-2" noValidate>
          <div className="space-y-2">
            <Label htmlFor="usuario-nombre">Nombre</Label>
            <Input
              id="usuario-nombre"
              aria-invalid={errors.nombre ? true : undefined}
              aria-describedby={errors.nombre ? "error-nombre" : undefined}
              {...register("nombre")}
            />
            {errors.nombre && (
              <p id="error-nombre" className="text-destructive text-xs">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario-apellido-paterno">Apellido paterno</Label>
            <Input
              id="usuario-apellido-paterno"
              aria-invalid={errors.apellido_paterno ? true : undefined}
              aria-describedby={errors.apellido_paterno ? "error-apellido-paterno" : undefined}
              {...register("apellido_paterno")}
            />
            {errors.apellido_paterno && (
              <p id="error-apellido-paterno" className="text-destructive text-xs">
                {errors.apellido_paterno.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario-apellido-materno">Apellido materno</Label>
            <Input
              id="usuario-apellido-materno"
              aria-invalid={errors.apellido_materno ? true : undefined}
              aria-describedby={errors.apellido_materno ? "error-apellido-materno" : undefined}
              {...register("apellido_materno")}
            />
            {errors.apellido_materno && (
              <p id="error-apellido-materno" className="text-destructive text-xs">
                {errors.apellido_materno.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario-correo">Correo electrónico</Label>
            <Input
              id="usuario-correo"
              type="email"
              autoComplete="off"
              disabled={esEdicion}
              aria-invalid={errors.correo_electronico ? true : undefined}
              aria-describedby={errors.correo_electronico ? "error-correo" : undefined}
              {...register("correo_electronico")}
            />
            {errors.correo_electronico && (
              <p id="error-correo" className="text-destructive text-xs">
                {errors.correo_electronico.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario-rol">Rol</Label>
            <Select
              key={`${usuarioInicial?.id ?? "nuevo"}-${abierto ? "abierto" : "cerrado"}`}
              defaultValue={usuarioInicial?.rol.id ?? ""}
              onValueChange={valor => setValue("rol_id", valor, { shouldValidate: true })}
            >
              <SelectTrigger
                id="usuario-rol"
                aria-label="Rol"
                aria-invalid={errors.rol_id ? true : undefined}
                aria-describedby={errors.rol_id ? "error-rol" : undefined}
              >
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {rolesAsignables.map(rol => (
                  <SelectItem key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol_id && (
              <p id="error-rol" className="text-destructive text-xs">
                {errors.rol_id.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={alCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : esEdicion ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
