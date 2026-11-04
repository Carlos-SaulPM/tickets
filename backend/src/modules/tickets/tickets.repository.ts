import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { EstadoTicket } from "@/generated/prisma/enums";

import type {
  ActualizarTicketRepositoryDTO,
  CrearHistorialRepositoryDTO,
  CrearMensajeRepositoryDTO,
  CrearNotificacionRepositoryDTO,
  CrearTicketRepositoryDTO,
  HistorialTicket,
  Notificacion,
  Ticket,
  TicketMensaje,
  TicketUsuarioDetalle,
} from "./tickets.types";

const usuarioResumenSelect = {
  id: true,
  nombre: true,
  apellido_paterno: true,
  correo_electronico: true,
} as const;

const ticketSelect = {
  id: true,
  codigo: true,
  asunto: true,
  descripcion: true,
  prioridad: true,
  estado: true,
  creado_en: true,
  actualizado_en: true,
  fecha_cierre: true,
  categoria: {
    select: {
      id: true,
      nombre: true,
    },
  },
  area: {
    select: {
      id: true,
      nombre: true,
    },
  },
  usuario_creador: {
    select: usuarioResumenSelect,
  },
  asignado_a: {
    select: usuarioResumenSelect,
  },
} satisfies Prisma.TicketSelect;

const mensajeSelect = {
  id: true,
  ticket_id: true,
  mensaje: true,
  es_nota_interna: true,
  es_propuesta_solucion: true,
  creado_en: true,
  usuario: {
    select: usuarioResumenSelect,
  },
  adjuntos: {
    select: {
      id: true,
      nombre_original: true,
      tipo_mime: true,
      ruta_url: true,
    },
  },
} satisfies Prisma.TicketMensajeSelect;

const historialSelect = {
  id: true,
  tipo_evento: true,
  estado_anterior: true,
  estado_nuevo: true,
  detalle: true,
  fecha_cambio: true,
  usuario: {
    select: usuarioResumenSelect,
  },
} satisfies Prisma.HistorialTicketSelect;

const notificacionSelect = {
  id: true,
  ticket_id: true,
  mensaje: true,
  leida: true,
  creado_en: true,
} satisfies Prisma.NotificacionSelect;

export class TicketRepository {
  async listarPaginado(
    where: Prisma.TicketWhereInput,
    skip: number,
    take: number
  ): Promise<{ total: number; tickets: Ticket[] }> {
    const [total, tickets] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        select: ticketSelect,
        orderBy: [{ creado_en: "desc" }, { id: "asc" }],
        skip,
        take,
      }),
    ]);

    return { total, tickets };
  }

  buscarPorId(id: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({
      where: { id },
      select: ticketSelect,
    });
  }

  contar(): Promise<number> {
    return prisma.ticket.count();
  }

  crear(data: CrearTicketRepositoryDTO): Promise<Ticket> {
    return prisma.ticket.create({
      data,
      select: ticketSelect,
    });
  }

  async actualizar(id: string, data: ActualizarTicketRepositoryDTO): Promise<Ticket | null> {
    const updateData: Prisma.TicketUncheckedUpdateManyInput = {};

    if (data.asunto !== undefined) updateData.asunto = data.asunto;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;
    if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id;
    if (data.area_id !== undefined) updateData.area_id = data.area_id;

    const result = await prisma.ticket.updateMany({
      where: { id },
      data: updateData,
    });

    if (result.count === 0) return null;

    return this.buscarPorId(id);
  }

  updateEstado(id: string, estado: EstadoTicket, fecha_cierre?: Date | null): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: {
        estado,
        ...(fecha_cierre !== undefined ? { fecha_cierre } : {}),
      },
      select: ticketSelect,
    });
  }

  asignar(id: string, asignado_a_id: string, estado: EstadoTicket): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: { asignado_a_id, estado },
      select: ticketSelect,
    });
  }

  async marcarActualizado(id: string): Promise<void> {
    await prisma.ticket.update({
      where: { id },
      data: { actualizado_en: new Date() },
    });
  }

  buscarCategoriaPorId(id: string) {
    return prisma.categoria.findUnique({
      where: { id },
      select: { id: true, nombre: true },
    });
  }

  buscarAreaPorId(id: string) {
    return prisma.area.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    });
  }

  buscarUsuarioPorId(id: string): Promise<TicketUsuarioDetalle | null> {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        ...usuarioResumenSelect,
        rol: {
          select: { nombre: true },
        },
      },
    });
  }

  crearMensaje(data: CrearMensajeRepositoryDTO): Promise<TicketMensaje> {
    return prisma.ticketMensaje.create({
      data,
      select: mensajeSelect,
    });
  }

  buscarMensajePorId(id: string): Promise<TicketMensaje | null> {
    return prisma.ticketMensaje.findUnique({
      where: { id },
      select: mensajeSelect,
    });
  }

  buscarMensajes(ticket_id: string, incluirNotasInternas: boolean): Promise<TicketMensaje[]> {
    return prisma.ticketMensaje.findMany({
      where: {
        ticket_id,
        ...(incluirNotasInternas ? {} : { es_nota_interna: false }),
      },
      select: mensajeSelect,
      orderBy: { creado_en: "asc" },
    });
  }

  crearHistorial(data: CrearHistorialRepositoryDTO): Promise<HistorialTicket> {
    return prisma.historialTicket.create({
      data,
      select: historialSelect,
    });
  }

  buscarHistorial(ticket_id: string): Promise<HistorialTicket[]> {
    return prisma.historialTicket.findMany({
      where: { ticket_id },
      select: historialSelect,
      orderBy: { fecha_cambio: "asc" },
    });
  }

  crearNotificacion(data: CrearNotificacionRepositoryDTO): Promise<Notificacion> {
    return prisma.notificacion.create({
      data,
      select: notificacionSelect,
    });
  }

  buscarNotificaciones(usuario_id: string): Promise<Notificacion[]> {
    return prisma.notificacion.findMany({
      where: { usuario_id },
      select: notificacionSelect,
      orderBy: { creado_en: "desc" },
    });
  }

  contarAdjuntosDisponibles(ticket_id: string, usuario_id: string, ids: string[]): Promise<number> {
    return prisma.archivoAdjunto.count({
      where: { id: { in: ids }, ticket_id, subido_por_id: usuario_id, mensaje_id: null },
    });
  }

  async enlazarAdjuntos(
    mensaje_id: string,
    ticket_id: string,
    usuario_id: string,
    ids: string[]
  ): Promise<void> {
    await prisma.archivoAdjunto.updateMany({
      where: { id: { in: ids }, ticket_id, subido_por_id: usuario_id, mensaje_id: null },
      data: { mensaje_id },
    });
  }

  async marcarNotificacionLeida(id: string, usuario_id: string): Promise<boolean> {
    const result = await prisma.notificacion.updateMany({
      where: { id, usuario_id },
      data: { leida: true },
    });

    return result.count > 0;
  }
}
