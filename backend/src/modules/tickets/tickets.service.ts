import { Prisma } from "@/generated/prisma/client";
import {
  EstadoTicket,
  NombreRol,
  PrioridadTicket,
  TipoEventoHistorial,
} from "@/generated/prisma/enums";
import { correoService } from "@/services/correo/correo.service";
import type { AuthUsuario } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import { TicketRepository } from "./tickets.repository";
import type { CreateMensajeInput, CreateTicketInput, UpdateTicketInput } from "./tickets.schema";
import type { Ticket, TicketMensaje, TicketUsuarioResumen } from "./tickets.types";

const esStaff = (rol: NombreRol) => rol === NombreRol.Administrador || rol === NombreRol.Soporte;

export class TicketsService {
  constructor(private readonly repository: TicketRepository = new TicketRepository()) {}

  private canView(ticket: Ticket, usuario: AuthUsuario): boolean {
    if (usuario.rol === NombreRol.Administrador) return true;

    if (usuario.rol === NombreRol.Soporte) {
      return ticket.asignado_a === null || ticket.asignado_a.id === usuario.id;
    }

    return ticket.usuario_creador.id === usuario.id;
  }

  private async getTicketPermitido(id: string, usuario: AuthUsuario): Promise<Ticket> {
    const ticket = await this.repository.findById(id);

    if (!ticket) {
      throw new ApiError(404, "No se ha encontrado el ticket");
    }

    if (!this.canView(ticket, usuario)) {
      throw new ApiError(403, "No tienes acceso a este ticket");
    }

    return ticket;
  }

  private async validarCategoria(categoria_id: string): Promise<void> {
    const categoria = await this.repository.findCategoriaById(categoria_id);

    if (!categoria) {
      throw new ApiError(400, "La categoría especificada no existe");
    }
  }

  private async validarArea(area_id: string | null): Promise<void> {
    if (!area_id) return;

    const area = await this.repository.findAreaById(area_id);

    if (!area || !area.activo) {
      throw new ApiError(400, "El área especificada no existe o está inactiva");
    }
  }

  private async generarTicket(data: CreateTicketInput, usuario: AuthUsuario): Promise<Ticket> {
    for (let intento = 0; intento < 5; intento += 1) {
      const codigo = `#TK-${String((await this.repository.count()) + 1 + intento).padStart(3, "0")}`;

      try {
        return await this.repository.create({
          codigo,
          asunto: data.asunto,
          descripcion: data.descripcion,
          prioridad: data.prioridad ?? PrioridadTicket.Media,
          categoria_id: data.categoria_id,
          area_id: data.area_id ?? null,
          usuario_creador_id: usuario.id,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          continue;
        }

        throw error;
      }
    }

    throw new ApiError(500, "No se pudo generar el código del ticket");
  }

  private async notificar(
    destinatario: TicketUsuarioResumen,
    ticket: Ticket,
    mensaje: string,
    plantilla: "TICKET_CREADO" | "SOLUCION_PROPUESTA" | "ESTADO_CAMBIADO"
  ): Promise<void> {
    await this.repository.createNotificacion({
      usuario_id: destinatario.id,
      ticket_id: ticket.id,
      mensaje,
    });

    await correoService.enviarCorreo({
      destinatario: destinatario.correo_electronico,
      asunto: `${ticket.codigo}: ${ticket.asunto}`,
      plantilla,
      datos: { ticket: ticket.codigo, mensaje },
    });
  }

  async getAll(usuario: AuthUsuario): Promise<Ticket[]> {
    if (usuario.rol === NombreRol.Administrador) {
      return this.repository.findAll({});
    }

    if (usuario.rol === NombreRol.Soporte) {
      return this.repository.findAll({
        OR: [{ asignado_a_id: usuario.id }, { asignado_a_id: null }],
      });
    }

    return this.repository.findAll({ usuario_creador_id: usuario.id });
  }

  async getById(id: string, usuario: AuthUsuario): Promise<Ticket> {
    return this.getTicketPermitido(id, usuario);
  }

  async create(data: CreateTicketInput, usuario: AuthUsuario): Promise<Ticket> {
    await this.validarCategoria(data.categoria_id);
    await this.validarArea(data.area_id ?? null);

    const ticket = await this.generarTicket(data, usuario);

    await this.repository.createHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CREACION,
      estado_anterior: null,
      estado_nuevo: EstadoTicket.Abierto,
      detalle: "Ticket creado",
    });

    await this.notificar(ticket.usuario_creador, ticket, "Tu ticket fue creado", "TICKET_CREADO");

    return ticket;
  }

  async update(id: string, data: UpdateTicketInput, usuario: AuthUsuario): Promise<Ticket> {
    if (usuario.rol !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }

    const ticket = await this.getTicketPermitido(id, usuario);

    if (data.categoria_id !== undefined) await this.validarCategoria(data.categoria_id);
    if (data.area_id !== undefined) await this.validarArea(data.area_id);

    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new ApiError(404, "No se ha encontrado el ticket");
    }

    if (data.prioridad !== undefined && data.prioridad !== ticket.prioridad) {
      await this.repository.createHistorial({
        ticket_id: ticket.id,
        usuario_id: usuario.id,
        tipo_evento: TipoEventoHistorial.CAMBIO_PRIORIDAD,
        estado_anterior: ticket.estado,
        estado_nuevo: updated.estado,
        detalle: `Prioridad cambiada de ${ticket.prioridad} a ${data.prioridad}`,
      });
    }

    return updated;
  }

  async assign(id: string, asignado_a_id: string, usuario: AuthUsuario): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);
    const destino = await this.repository.findUsuarioById(asignado_a_id);

    if (!destino) {
      throw new ApiError(404, "No se ha encontrado el usuario a asignar");
    }

    if (destino.rol.nombre !== NombreRol.Soporte) {
      throw new ApiError(400, "Solo se puede asignar a un usuario de Soporte");
    }

    if (usuario.rol === NombreRol.Soporte) {
      if (asignado_a_id !== usuario.id) {
        throw new ApiError(403, "Soporte solo puede asignarse tickets a sí mismo");
      }

      if (ticket.asignado_a !== null && ticket.asignado_a.id !== usuario.id) {
        throw new ApiError(403, "El ticket ya está asignado a otro usuario");
      }
    } else if (usuario.rol !== NombreRol.Administrador) {
      throw new ApiError(403, "No tienes permiso para asignar tickets");
    }

    if (ticket.estado !== EstadoTicket.Abierto && ticket.estado !== EstadoTicket.En_proceso) {
      throw new ApiError(400, "No se puede asignar un ticket en este estado");
    }

    const estado = ticket.estado === EstadoTicket.Abierto ? EstadoTicket.En_proceso : ticket.estado;
    const updated = await this.repository.assign(id, asignado_a_id, estado);

    await this.repository.createHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.REASIGNACION,
      estado_anterior: ticket.estado,
      estado_nuevo: updated.estado,
      detalle: `Ticket asignado a ${destino.nombre} ${destino.apellido_paterno}`,
    });

    await this.notificar(destino, updated, "Se te asignó un ticket", "ESTADO_CAMBIADO");

    return updated;
  }

  async getMensajes(id: string, usuario: AuthUsuario): Promise<TicketMensaje[]> {
    await this.getTicketPermitido(id, usuario);
    return this.repository.findMensajes(id, esStaff(usuario.rol));
  }

  async addMensaje(
    id: string,
    data: CreateMensajeInput,
    usuario: AuthUsuario
  ): Promise<TicketMensaje> {
    const ticket = await this.getTicketPermitido(id, usuario);
    const esNotaInterna = data.es_nota_interna ?? false;
    const esPropuesta = data.es_propuesta_solucion ?? false;

    if (esNotaInterna && !esStaff(usuario.rol)) {
      throw new ApiError(403, "Solo Soporte y Administrador pueden crear notas internas");
    }

    if (esPropuesta) {
      if (usuario.rol !== NombreRol.Soporte) {
        throw new ApiError(403, "Solo Soporte puede proponer una solución");
      }

      if (ticket.asignado_a?.id !== usuario.id) {
        throw new ApiError(403, "Solo el Soporte asignado puede proponer una solución");
      }

      if (ticket.estado !== EstadoTicket.En_proceso) {
        throw new ApiError(400, "El ticket debe estar En_proceso para proponer una solución");
      }
    }

    const mensaje = await this.repository.createMensaje({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      mensaje: data.mensaje,
      es_nota_interna: esNotaInterna,
      es_propuesta_solucion: esPropuesta,
    });

    await this.repository.touch(ticket.id);

    if (esPropuesta) {
      const updated = await this.repository.updateEstado(ticket.id, EstadoTicket.En_revision);

      await this.repository.createHistorial({
        ticket_id: ticket.id,
        usuario_id: usuario.id,
        tipo_evento: TipoEventoHistorial.PROPUESTA_SOLUCION,
        estado_anterior: ticket.estado,
        estado_nuevo: updated.estado,
        detalle: "Solución propuesta al usuario",
      });

      await this.notificar(
        ticket.usuario_creador,
        updated,
        "Se propuso una solución a tu ticket",
        "SOLUCION_PROPUESTA"
      );
    }

    return mensaje;
  }

  async aprobar(id: string, usuario: AuthUsuario): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);

    if (ticket.usuario_creador.id !== usuario.id) {
      throw new ApiError(403, "Solo el creador puede aprobar la solución");
    }

    if (ticket.estado !== EstadoTicket.En_revision) {
      throw new ApiError(400, "El ticket no está en revisión");
    }

    const updated = await this.repository.updateEstado(id, EstadoTicket.Resuelto, new Date());

    await this.repository.createHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CAMBIO_ESTADO,
      estado_anterior: ticket.estado,
      estado_nuevo: updated.estado,
      detalle: "Solución aprobada por el usuario",
    });

    if (updated.asignado_a) {
      await this.notificar(
        updated.asignado_a,
        updated,
        "El usuario aprobó la solución",
        "ESTADO_CAMBIADO"
      );
    }

    return updated;
  }

  async rechazar(id: string, usuario: AuthUsuario): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);

    if (ticket.usuario_creador.id !== usuario.id) {
      throw new ApiError(403, "Solo el creador puede rechazar la solución");
    }

    if (ticket.estado !== EstadoTicket.En_revision) {
      throw new ApiError(400, "El ticket no está en revisión");
    }

    const updated = await this.repository.updateEstado(id, EstadoTicket.En_proceso);

    await this.repository.createHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CAMBIO_ESTADO,
      estado_anterior: ticket.estado,
      estado_nuevo: updated.estado,
      detalle: "Solución rechazada por el usuario",
    });

    if (updated.asignado_a) {
      await this.notificar(
        updated.asignado_a,
        updated,
        "El usuario rechazó la solución",
        "ESTADO_CAMBIADO"
      );
    }

    return updated;
  }

  async getHistorial(id: string, usuario: AuthUsuario) {
    await this.getTicketPermitido(id, usuario);
    return this.repository.findHistorial(id);
  }

  async getNotificaciones(usuario: AuthUsuario) {
    return this.repository.findNotificaciones(usuario.id);
  }

  async marcarNotificacionLeida(id: string, usuario: AuthUsuario): Promise<void> {
    const updated = await this.repository.markNotificacionLeida(id, usuario.id);

    if (!updated) {
      throw new ApiError(404, "No se ha encontrado la notificación");
    }
  }
}
