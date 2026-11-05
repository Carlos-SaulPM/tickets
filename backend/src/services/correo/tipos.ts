export type PlantillaCorreo = "MENSAJE_NUEVO" | "SOLUCION_PROPUESTA" | "ESTADO_CAMBIADO";

export interface CorreoNotificacionPayload {
  destinatario: string;
  asunto: string;
  plantilla: PlantillaCorreo;
  datos: Record<string, unknown>;
}

export interface ServicioCorreo {
  /**
   * Devuelve `false` en lugar de lanzar: un fallo del SMTP no debe tumbar
   * la operación que originó el aviso.
   */
  enviarCorreo(payload: CorreoNotificacionPayload): Promise<boolean>;
}
