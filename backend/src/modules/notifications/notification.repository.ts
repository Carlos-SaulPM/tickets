import { PrismaClient, type Prisma } from '@/generated/prisma/client';

export const prisma = new PrismaClient({} as any);

export type Notificacion = Prisma.NotificacionGetPayload<{}>;

export type CreateNotificationInput = {
  userId: string;
  ticketId?: string;
  message: string;
};

export class NotificationRepository {
  async save(data: CreateNotificationInput): Promise<Notificacion> {
    return await prisma.notificacion.create({
      data: {
        usuario_id: data.userId,
        ticket_id: data.ticketId || null,
        mensaje: data.message,
      },
      include: {
        ticket: {
          select: {
            codigo: true,
            asunto: true,
            estado: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Notificacion[]> {
    return await prisma.notificacion.findMany({
      where: { usuario_id: userId },
      include: {
        ticket: {
          select: {
            codigo: true,
            asunto: true,
          },
        },
      },
      orderBy: { creado_en: 'desc' },
    });
  }

  async markAsRead(id: string): Promise<Notificacion> {
    return await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }
}