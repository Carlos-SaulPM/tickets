import { z } from "zod";

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
  apellido_paterno: z.string().trim().min(1).max(50),
  apellido_materno: z.string().trim().min(1).max(50),
  correo_electronico: z.string().trim().email().max(100),
  rol_id: z.uuid(),
});

export const actualizarUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    apellido_paterno: z.string().trim().min(1).max(50).optional(),
    apellido_materno: z.string().trim().min(1).max(50).optional(),
    rol_id: z.uuid().optional(),
    estado: z.enum(["Activo", "Inactivo", "Baja"]).optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: "Debes enviar al menos un campo" });

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;

export const listarUsuariosQuerySchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(10),
  buscar: z.string().trim().optional(),
  estado: z.enum(["Activo", "Inactivo", "Baja"]).optional(),
  rol: z.enum(["Administrador", "Soporte", "Usuario"]).optional(),
});

export type ListarUsuariosQuery = z.infer<typeof listarUsuariosQuerySchema>;
