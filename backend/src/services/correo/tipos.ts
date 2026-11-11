export type PlantillaCorreo = "MENSAJE_NUEVO" | "SOLUCION_PROPUESTA" | "ESTADO_CAMBIADO";

export interface CorreoNotificacionPayload {
  destinatario: string;
  asunto: string;
  plantilla: PlantillaCorreo;
  datos: Record<string, unknown>;
}

export interface ServicioCorreo {
  enviarCorreo(payload: CorreoNotificacionPayload): Promise<boolean>;
}
