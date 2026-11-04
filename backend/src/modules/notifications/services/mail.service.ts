import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 1025,
      secure: false, // TLS desactivado para desarrollo local
    });
  }

  async sendTicketCreatedNotification(to: string, ticketId: string, title: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Sistema de Tickets" <no-reply@sistema-tickets.local>',
      to,
      subject: `Nuevo Ticket Creado: #${ticketId}`,
      html: `
        <h2>Se ha registrado un nuevo ticket</h2>
        <p><strong>ID:</strong> ${ticketId}</p>
        <p><strong>Título:</strong> ${title}</p>
        <p>Revisa la plataforma para asignarlo a un técnico.</p>
      `,
    });
  }
}