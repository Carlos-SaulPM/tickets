import { env } from "@/config/env";

import { ServicioCorreoNodemailer } from "./servicio-nodemailer";
import type { CorreoNotificacionPayload, ServicioCorreo } from "./tipos";

export type { CorreoNotificacionPayload, PlantillaCorreo, ServicioCorreo } from "./tipos";

class MockServicioCorreo implements ServicioCorreo {
  enviarCorreo(payload: CorreoNotificacionPayload): Promise<boolean> {
    console.log(`[MOCK EMAIL] Para: ${payload.destinatario} | Asunto: ${payload.asunto}`);

    return Promise.resolve(true);
  }
}

const crearServicioCorreo = (): ServicioCorreo => {
  if (!env.SMTP_HOST) return new MockServicioCorreo();

  const autenticacion =
    env.SMTP_USER && env.SMTP_PASS
      ? { usuario: env.SMTP_USER, contrasena: env.SMTP_PASS }
      : undefined;

  return new ServicioCorreoNodemailer({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    remitente: env.SMTP_FROM,
    urlPublica: env.FRONTEND_URL,
    autenticacion,
  });
};

export const correoService: ServicioCorreo = crearServicioCorreo();
