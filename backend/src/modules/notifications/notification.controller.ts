import type { Request, Response } from 'express';
import { SendTestNotificationSchema } from './dto/notification.dto';
import { NotificationService } from './services/notification.service';
export class NotificationController {
  constructor(private notificationService: NotificationService) { }

  sendTestNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = SendTestNotificationSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Error de validación',
          details: validation.error.flatten().fieldErrors,
        });
        return;
      }

      const notification = await this.notificationService.notifyTicketCreation(validation.data);

      res.status(201).json({
        message: 'Notificación guardada en PostgreSQL y correo enviado',
        data: notification,
      });
    } catch (error: any) {


      if (error?.code === 'P2003') {
        res.status(404).json({
          error: 'El usuario_id o ticket_id especificado no existe en la base de datos',
        });
        return;
      }

      console.error('Error en sendTestNotification:', error);
      res.status(500).json({ error: 'Fallo interno al procesar la notificación' });
    }
  };


  getUSerNotifications = async (req: Request, res: Response): Promise<void> => {
    try {

      const userId = req.params;

      if (!userId || typeof userId !== "string") {
        res.status(400).json({ error: 'El parámetro userId es requerido' });
        return;
      }

      const notifications = await this.notificationService.getUserNotifications(userId);

      res.status(200).json({
        message: "Notificaciones obtenidas con exito",
        data: notifications
      })

    } catch (error) {
      console.error('Error en getUserNotifications:', error);
      res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
  }
}