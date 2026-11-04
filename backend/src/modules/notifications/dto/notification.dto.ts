// src/modules/notifications/dto/notification.dto.ts
import { z } from 'zod';

export const SendTestNotificationSchema = z.object({
  userId: z.string().uuid('El userId debe ser un UUID válido existente'),
  userEmail: z.string().email('Correo electrónico inválido'),
  ticketId: z.string().uuid('El ticketId debe ser un UUID válido').optional(),
  title: z.string().min(1, 'El título es requerido'),
});

export type SendTestNotificationInput = z.infer<typeof SendTestNotificationSchema>;