import { NotificationRepository } from '../notification.repository';
import { MailService } from './mail.service';

export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
    private mailService: MailService
  ) {}

  async notifyTicketCreation(data: {
    userId: string;
    userEmail: string;
    ticketId?: string | undefined;
    title: string;
  }) {
    const notification = await this.notificationRepo.save({
      userId: data.userId,
      ...(data.ticketId !== undefined && {
        ticketId: data.ticketId
      }),
      message: `Nuevo ticket asignado/creado: ${data.title}`
    });

    // 2. Enviar correo vía Mailpit / Nodemailer
    await this.mailService.sendTicketCreatedNotification(
      data.userEmail,
      data.ticketId || 'N/A',
      data.title
    );

    return notification;
  }

  async getUserNotifications(userId: string) {
    return await this.notificationRepo.findByUserId(userId);
  }
}