import nodemailer, { type Transporter } from "nodemailer";

import { construirCorreo } from "./plantillas";
import type { CorreoNotificacionPayload, ServicioCorreo } from "./tipos";

export interface ConfiguracionSmtp {
  host: string;
  port: number;
  secure: boolean;
  remitente: string;
  urlPublica: string;
  autenticacion?: { usuario: string; contrasena: string } | undefined;
}

export class ServicioCorreoNodemailer implements ServicioCorreo {
  private readonly transporter: Transporter;

  constructor(private readonly configuracion: ConfiguracionSmtp) {
    const { host, port, secure, autenticacion } = configuracion;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(autenticacion
        ? { auth: { user: autenticacion.usuario, pass: autenticacion.contrasena } }
        : {}),
    });
  }

  async enviarCorreo(payload: CorreoNotificacionPayload): Promise<boolean> {
    const enlace = this.enlaceAlTicket(payload.datos);
    const { html, texto } = construirCorreo(payload.plantilla, payload.datos, enlace);

    try {
      await this.transporter.sendMail({
        from: this.configuracion.remitente,
        to: payload.destinatario,
        subject: payload.asunto,
        html,
        text: texto,
      });

      return true;
    } catch (error) {
      console.error(`No se pudo enviar el correo a ${payload.destinatario}`, error);

      return false;
    }
  }

  private enlaceAlTicket(datos: Record<string, unknown>) {
    const id = datos.ticket_id;

    if (typeof id !== "string" || !id) return "";

    return `${this.configuracion.urlPublica.replace(/\/$/, "")}/tickets/${id}`;
  }
}
