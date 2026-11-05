import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
        </DialogHeader>

        <form onSubmit={handleSubmit(alGuardar)} className="space-y-4 pt-2">
          <div>
            <Input placeholder="Nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-destructive mt-1 text-xs">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <Input placeholder="Apellido paterno" {...register("apellido_paterno")} />
            {errors.apellido_paterno && (
              <p className="text-destructive mt-1 text-xs">{errors.apellido_paterno.message}</p>
            )}
          </div>

          <div>
            <Input placeholder="Apellido materno" {...register("apellido_materno")} />
            {errors.apellido_materno && (
              <p className="text-destructive mt-1 text-xs">{errors.apellido_materno.message}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Correo electrónico"
              type="email"
              disabled={esEdicion}
              {...register("correo_electronico")}
            />
            {errors.correo_electronico && (
              <p className="text-destructive mt-1 text-xs">{errors.correo_electronico.message}</p>
            )}
          </div>

          <div>
            <Select
              key={`${usuarioInicial?.id ?? "nuevo"}-${abierto ? "abierto" : "cerrado"}`}
              defaultValue={usuarioInicial?.rol.id ?? ""}
              onValueChange={valor => setValue("rol_id", valor)}
            >
              <SelectTrigger>
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
              <p className="text-destructive mt-1 text-xs">{errors.rol_id.message}</p>
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
