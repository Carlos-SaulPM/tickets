export type PlantillaCorreo = "TICKET_CREADO" | "SOLUCION_PROPUESTA" | "ESTADO_CAMBIADO";

export interface CorreoNotificacionPayload {
  destinatario: string;
  asunto: string;
  plantilla: PlantillaCorreo;
  datos: Record<string, unknown>;
}

export interface ServicioCorreoInterface {
  enviarCorreo(payload: CorreoNotificacionPayload): Promise<boolean>;
}

export class MockServicioCorreo implements ServicioCorreoInterface {
  enviarCorreo(payload: CorreoNotificacionPayload): Promise<boolean> {
    console.log(`[MOCK EMAIL] Para: ${payload.destinatario} | Asunto: ${payload.asunto}`);
    return Promise.resolve(true);
  }
}

export const correoService: ServicioCorreoInterface = new MockServicioCorreo();
