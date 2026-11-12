import type { AccionAuditoria, EntidadAuditoria } from "@/generated/prisma/enums";

export interface RegistrarAuditoriaDTO {
  usuario_id: string;
  accion: AccionAuditoria;
  entidad: EntidadAuditoria;
  entidad_id: string;
  detalle?: string | null;
}

export interface AuditoriaResumen {
  id: string;
  accion: AccionAuditoria;
  entidad: EntidadAuditoria;
  entidad_id: string;
  detalle: string | null;
  creado_en: Date;
  usuario: {
    id: string;
    nombre: string;
    apellido_paterno: string;
  };
}
