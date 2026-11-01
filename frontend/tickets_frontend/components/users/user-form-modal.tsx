import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserSchema } from "@/schemas/user.schema";
import { CreateUserInput, User } from "@/types/user.types";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: User | null;
}

export function UserFormModal({ isOpen, onClose, onSubmit, initialData }: UserFormModalProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        apellido_paterno: initialData.apellido_paterno,
        apellido_materno: initialData.apellido_materno,
        email: initialData.email,
        id_rol: initialData.id_rol,
        id_area: initialData.id_area || "",
      });
    } else {
      reset({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        id_rol: "",
        id_area: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: any) => {
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
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">{errors.email.message?.toString()}</p>
            )}
          </div>
          <div>
            <Select
              onValueChange={val => setValue("id_rol", val)}
              defaultValue={initialData?.id_rol}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rol-soporte-id">Soporte</SelectItem>
                <SelectItem value="rol-usuario-id">Usuario</SelectItem>
              </SelectContent>
            </Select>
            {errors.id_rol && (
              <p className="text-destructive mt-1 text-xs">{errors.id_rol.message?.toString()}</p>
            )}
          </div>
          <div>
            <Select
              onValueChange={val => setValue("id_area", val)}
              defaultValue={initialData?.id_area || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Área (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area-123">Área 123</SelectItem>
                <SelectItem value="area-456">Área 456</SelectItem>
              </SelectContent>
            </Select>
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
