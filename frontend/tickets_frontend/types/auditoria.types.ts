export type AccionAuditoria =
  "CREAR" | "EDITAR" | "BAJA" | "REACTIVAR" | "RESTABLECER_CONTRASENA" | "REABRIR";

export type EntidadAuditoria = "USUARIO" | "AREA" | "CATEGORIA" | "TICKET";

export interface RegistroAuditoria {
  id: string;
  accion: AccionAuditoria;
  entidad: EntidadAuditoria;
  entidad_id: string;
  detalle: string | null;
  creado_en: string;
  usuario: {
    id: string;
    nombre: string;
    apellido_paterno: string;
  };
}

export interface MetaAuditoria {
  pagina: number;
  limite: number;
  total: number;
  total_paginas: number;
}

export interface PaginaAuditoria {
  data: RegistroAuditoria[];
  meta: MetaAuditoria;
}
