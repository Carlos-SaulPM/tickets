import { Router } from 'express';
import { NotificationRepository } from './notification.repository';
import { MailService } from './services/mail.service';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';

const router = Router();

const notificationRepo = new NotificationRepository();
const mailService = new MailService();
const notificationService = new NotificationService(notificationRepo, mailService);
const notificationController = new NotificationController(notificationService);

router.post('/test', notificationController.sendTestNotification);
router.get('/user/:userId', notificationController.getUSerNotifications);

export default router;