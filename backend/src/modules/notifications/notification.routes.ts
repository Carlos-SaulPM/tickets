import { Router } from 'express';
import { NotificationRepository } from './notification.repository';
import { MailService } from './services/mail.service';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';

const router = Router();

// Inyección de dependencias manual
const notificationRepo = new NotificationRepository();
const mailService = new MailService();
const notificationService = new NotificationService(notificationRepo, mailService);
const notificationController = new NotificationController(notificationService);

// Definición de endpoints
router.post('/test', notificationController.sendTestNotification);
router.get('/user/:userId', notificationController.getUserNotifications);

export default router;