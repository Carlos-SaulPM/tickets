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
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearUsuarioInput) => Promise<void>;
  initialData?: Usuario | null;
  roles: Rol[];
}

export function ModalUsuario({ isOpen, onClose, onSubmit, initialData, roles }: ModalUsuarioProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrearUsuarioInput>({
    resolver: zodResolver(crearUsuarioSchema),
  });

  const assignableRoles = roles.filter(
    role => role.nombre !== "Administrador" || initialData?.rol.nombre === "Administrador"
  );

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        apellido_paterno: initialData.apellido_paterno,
        apellido_materno: initialData.apellido_materno,
        correo_electronico: initialData.correo_electronico,
        rol_id: initialData.rol.id,
      });
    } else {
      reset({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        correo_electronico: "",
        rol_id: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: CrearUsuarioInput) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          <div>
            <Input placeholder="Nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-destructive mt-1 text-xs">{errors.nombre.message?.toString()}</p>
            )}
          </div>
          <div>
            <Input placeholder="Apellido Paterno" {...register("apellido_paterno")} />
            {errors.apellido_paterno && (
              <p className="text-destructive mt-1 text-xs">
                {errors.apellido_paterno.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <Input placeholder="Apellido Materno" {...register("apellido_materno")} />
            {errors.apellido_materno && (
              <p className="text-destructive mt-1 text-xs">
                {errors.apellido_materno.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <Input
              placeholder="Correo Electrónico"
              type="email"
              disabled={isEditing}
              {...register("correo_electronico")}
            />
            {errors.correo_electronico && (
              <p className="text-destructive mt-1 text-xs">
                {errors.correo_electronico.message?.toString()}
              </p>
            )}
          </div>
          <div>
            <Select
              key={`${initialData?.id ?? "new"}-${isOpen ? "open" : "closed"}`}
              defaultValue={initialData?.rol.id ?? ""}
              onValueChange={value => setValue("rol_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Rol" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol_id && (
              <p className="text-destructive mt-1 text-xs">{errors.rol_id.message?.toString()}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
