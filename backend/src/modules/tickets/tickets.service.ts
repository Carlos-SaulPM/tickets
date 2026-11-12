import { Prisma } from "@/generated/prisma/client";
import {
  EstadoTicket,
  NombreRol,
  PrioridadTicket,
  TipoEventoHistorial,
} from "@/generated/prisma/enums";
import { correoService } from "@/services/correo/correo.service";
import type { PlantillaCorreo } from "@/services/correo/tipos";
import type { UsuarioAutenticado } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";
import { sanitizarHtml } from "@/utils/sanitizar-html";

import { puedeVerTicket } from "./tickets.permissions";
import { TicketRepository } from "./tickets.repository";
import type {
  ActualizarTicketInput,
  CrearMensajeInput,
  CrearTicketInput,
  ListarNotificacionesQuery,
  ListarTicketsQuery,
} from "./tickets.schema";
import type { Ticket, TicketMensaje, TicketUsuarioResumen } from "./tickets.types";

const esStaff = (rol: NombreRol) => rol === NombreRol.Administrador || rol === NombreRol.Soporte;

const ESTADOS_CERRABLES: readonly EstadoTicket[] = [
  EstadoTicket.Abierto,
  EstadoTicket.En_proceso,
  EstadoTicket.En_revision,
  EstadoTicket.Resuelto,
];

export class TicketsService {
  constructor(private readonly repository: TicketRepository = new TicketRepository()) {}

  private puedeCerrar(ticket: Ticket, usuario: UsuarioAutenticado): boolean {
    if (usuario.rol === NombreRol.Administrador) return true;

    if (usuario.rol === NombreRol.Soporte) {
      return ticket.asignado_a?.id === usuario.id;
    }

    return false;
  }

  private async getTicketPermitido(id: string, usuario: UsuarioAutenticado): Promise<Ticket> {
    const ticket = await this.repository.buscarPorId(id);

    if (!ticket) {
      throw new ApiError(404, "No se ha encontrado el ticket");
    }

    if (!puedeVerTicket(ticket, usuario)) {
      throw new ApiError(403, "No tienes acceso a este ticket");
    }

    return ticket;
  }

  private verificarPropuestaDelCreador(ticket: Ticket, usuario: UsuarioAutenticado): void {
    if (ticket.usuario_creador.id !== usuario.id) {
      throw new ApiError(403, "Solo el creador puede decidir sobre la solución");
    }

    if (ticket.estado !== EstadoTicket.En_revision) {
      throw new ApiError(400, "El ticket no está en revisión");
    }
  }

  private async validarCategoria(categoria_id: string): Promise<void> {
    const categoria = await this.repository.buscarCategoriaPorId(categoria_id);

    if (!categoria) {
      throw new ApiError(400, "La categoría especificada no existe");
    }

    if (!categoria.activo) {
      throw new ApiError(400, "La categoría especificada está inactiva");
    }
  }

  private async validarArea(area_id: string | null): Promise<void> {
    if (!area_id) return;

    const area = await this.repository.buscarAreaPorId(area_id);

    if (!area || !area.activo) {
      throw new ApiError(400, "El área especificada no existe o está inactiva");
    }
  }

  private async generarTicket(
    data: CrearTicketInput,
    usuario: UsuarioAutenticado
  ): Promise<Ticket> {
    for (let intento = 0; intento < 5; intento += 1) {
      const codigo = `#TK-${String((await this.repository.contar()) + 1 + intento).padStart(3, "0")}`;

      try {
        return await this.repository.crear({
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
    plantilla: PlantillaCorreo
  ): Promise<void> {
    await this.repository.crearNotificacion({
      usuario_id: destinatario.id,
      ticket_id: ticket.id,
      mensaje,
    });

    const cuenta = await this.repository.buscarUsuarioPorId(destinatario.id);

    if (cuenta?.rol.nombre === NombreRol.Administrador) return;

    await correoService.enviarCorreo({
      destinatario: destinatario.correo_electronico,
      asunto: `${ticket.codigo}: ${ticket.asunto}`,
      plantilla,
      datos: { ticket: ticket.codigo, ticket_id: ticket.id, mensaje },
    });
  }

  private construirWhere(
    usuario: UsuarioAutenticado,
    filtros: ListarTicketsQuery
  ): Prisma.TicketWhereInput {
    const visibilidad: Prisma.TicketWhereInput =
      usuario.rol === NombreRol.Administrador
        ? {}
        : usuario.rol === NombreRol.Soporte
          ? { OR: [{ asignado_a_id: usuario.id }, { asignado_a_id: null }] }
          : { usuario_creador_id: usuario.id };

    const condiciones: Prisma.TicketWhereInput[] = [visibilidad];

    if (filtros.estado) condiciones.push({ estado: filtros.estado });
    if (filtros.prioridad) condiciones.push({ prioridad: filtros.prioridad });
    if (filtros.area_id) condiciones.push({ area_id: filtros.area_id });
    if (filtros.categoria_id) condiciones.push({ categoria_id: filtros.categoria_id });

    if (filtros.asignado === "sin_asignar") condiciones.push({ asignado_a_id: null });
    if (filtros.asignado === "mios") condiciones.push({ asignado_a_id: usuario.id });

    if (filtros.buscar) {
      condiciones.push({
        OR: [
          { codigo: { contains: filtros.buscar, mode: "insensitive" } },
          { asunto: { contains: filtros.buscar, mode: "insensitive" } },
          { descripcion: { contains: filtros.buscar, mode: "insensitive" } },
        ],
      });
    }

    return { AND: condiciones };
  }

  async listar(usuario: UsuarioAutenticado, filtros: ListarTicketsQuery) {
    const where = this.construirWhere(usuario, filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;
    const orderBy: Prisma.TicketOrderByWithRelationInput[] =
      filtros.orden === "prioridad"
        ? [{ prioridad: "desc" }, { creado_en: "desc" }, { id: "asc" }]
        : filtros.orden === "actualizados"
          ? [{ actualizado_en: "desc" }, { id: "asc" }]
          : [{ creado_en: "desc" }, { id: "asc" }];
    const { total, tickets } = await this.repository.listarPaginado(
      where,
      skip,
      filtros.limite,
      orderBy
    );

    return {
      tickets,
      meta: {
        pagina: filtros.pagina,
        limite: filtros.limite,
        total,
        total_paginas: Math.ceil(total / filtros.limite),
      },
    };
  }

  async obtenerPorId(id: string, usuario: UsuarioAutenticado): Promise<Ticket> {
    return this.getTicketPermitido(id, usuario);
  }

  async crear(data: CrearTicketInput, usuario: UsuarioAutenticado): Promise<Ticket> {
    await this.validarCategoria(data.categoria_id);
    await this.validarArea(data.area_id ?? null);

    const ticket = await this.generarTicket(data, usuario);

    await this.repository.crearHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CREACION,
      estado_anterior: null,
      estado_nuevo: EstadoTicket.Abierto,
      detalle: "Ticket creado",
    });

    return ticket;
  }

  async actualizar(
    id: string,
    data: ActualizarTicketInput,
    usuario: UsuarioAutenticado
  ): Promise<Ticket> {
    if (usuario.rol !== NombreRol.Administrador) {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }

    const ticket = await this.getTicketPermitido(id, usuario);

    if (data.categoria_id !== undefined) await this.validarCategoria(data.categoria_id);
    if (data.area_id !== undefined) await this.validarArea(data.area_id);

    const updated = await this.repository.actualizar(id, data);

    if (!updated) {
      throw new ApiError(404, "No se ha encontrado el ticket");
    }

    if (data.prioridad !== undefined && data.prioridad !== ticket.prioridad) {
      await this.repository.crearHistorial({
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

  async asignar(id: string, asignado_a_id: string, usuario: UsuarioAutenticado): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);
    const destino = await this.repository.buscarUsuarioPorId(asignado_a_id);

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
    const updated = await this.repository.asignar(id, asignado_a_id, estado);

    await this.repository.crearHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.REASIGNACION,
      estado_anterior: ticket.estado,
      estado_nuevo: updated.estado,
      detalle: `Ticket asignado a ${destino.nombre} ${destino.apellido_paterno}`,
    });

    if (destino.id !== usuario.id) {
      await this.notificar(destino, updated, "Se te asignó un ticket", "ESTADO_CAMBIADO");
    }

    return updated;
  }

  async cambiarEstado(
    id: string,
    estado: EstadoTicket,
    usuario: UsuarioAutenticado
  ): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);

    if (!this.puedeCerrar(ticket, usuario)) {
      throw new ApiError(403, "No tienes permiso para cambiar el estado del ticket");
    }

    if (estado !== EstadoTicket.Cerrado) {
      throw new ApiError(
        400,
        "Solo se puede cerrar el ticket desde este endpoint; el resto de transiciones tiene su propia ruta"
      );
    }

    if (!ESTADOS_CERRABLES.includes(ticket.estado)) {
      throw new ApiError(400, "El ticket ya está cerrado");
    }

    const updated = await this.repository.updateEstado(id, EstadoTicket.Cerrado, new Date());

    await this.repository.crearHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CAMBIO_ESTADO,
      estado_anterior: ticket.estado,
      estado_nuevo: updated.estado,
      detalle: "Ticket cerrado",
    });

    if (updated.usuario_creador.id !== usuario.id) {
      await this.notificar(
        updated.usuario_creador,
        updated,
        "Tu ticket fue cerrado",
        "ESTADO_CAMBIADO"
      );
    }

    if (updated.asignado_a && updated.asignado_a.id !== usuario.id) {
      await this.notificar(
        updated.asignado_a,
        updated,
        "El ticket que tenías asignado fue cerrado",
        "ESTADO_CAMBIADO"
      );
    }

    return updated;
  }

  async obtenerMensajes(id: string, usuario: UsuarioAutenticado): Promise<TicketMensaje[]> {
    await this.getTicketPermitido(id, usuario);
    return this.repository.buscarMensajes(id, esStaff(usuario.rol));
  }

  async agregarMensaje(
    id: string,
    data: CrearMensajeInput,
    usuario: UsuarioAutenticado
  ): Promise<TicketMensaje> {
    const ticket = await this.getTicketPermitido(id, usuario);

    if (ticket.estado === EstadoTicket.Cerrado || ticket.estado === EstadoTicket.Resuelto) {
      throw new ApiError(400, "El ticket está cerrado y no admite mensajes");
    }

    if (usuario.rol === NombreRol.Soporte && ticket.asignado_a?.id !== usuario.id) {
      throw new ApiError(403, "Toma el ticket antes de responder");
    }

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

    const adjuntoIds = data.adjunto_ids ?? [];

    if (adjuntoIds.length > 0) {
      const disponibles = await this.repository.contarAdjuntosDisponibles(
        ticket.id,
        usuario.id,
        adjuntoIds
      );

      if (disponibles !== adjuntoIds.length) {
        throw new ApiError(400, "Alguno de los adjuntos no está disponible para este ticket");
      }
    }

    const mensaje = await this.repository.crearMensaje({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      mensaje: sanitizarHtml(data.mensaje),
      es_nota_interna: esNotaInterna,
      es_propuesta_solucion: esPropuesta,
    });

    if (adjuntoIds.length > 0) {
      await this.repository.enlazarAdjuntos(mensaje.id, ticket.id, usuario.id, adjuntoIds);
    }

    await this.repository.marcarActualizado(ticket.id);

    const mensajeConAdjuntos =
      adjuntoIds.length > 0 ? await this.repository.buscarMensajePorId(mensaje.id) : null;

    if (esPropuesta) {
      const updated = await this.repository.updateEstado(ticket.id, EstadoTicket.En_revision);

      await this.repository.crearHistorial({
        ticket_id: ticket.id,
        usuario_id: usuario.id,
        tipo_evento: TipoEventoHistorial.PROPUESTA_SOLUCION,
        estado_anterior: ticket.estado,
        estado_nuevo: updated.estado,
        detalle: "Solución propuesta al usuario",
      });

      if (ticket.usuario_creador.id !== usuario.id) {
        await this.notificar(
          ticket.usuario_creador,
          updated,
          "Se propuso una solución a tu ticket",
          "SOLUCION_PROPUESTA"
        );
      }
    } else if (!esNotaInterna) {
      const destinatario =
        usuario.rol === NombreRol.Usuario ? ticket.asignado_a : ticket.usuario_creador;

      if (destinatario && destinatario.id !== usuario.id) {
        await this.notificar(
          destinatario,
          ticket,
          `Nuevo mensaje de ${usuario.nombre}`,
          "MENSAJE_NUEVO"
        );
      }
    }

    return mensajeConAdjuntos ?? mensaje;
  }

  async aprobar(id: string, usuario: UsuarioAutenticado): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);
    this.verificarPropuestaDelCreador(ticket, usuario);

    const updated = await this.repository.updateEstado(id, EstadoTicket.Cerrado, new Date());

    await this.repository.crearHistorial({
      ticket_id: ticket.id,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CAMBIO_ESTADO,
      estado_anterior: ticket.estado,
      estado_nuevo: updated.estado,
      detalle: "Solución aprobada; ticket cerrado",
    });

    if (updated.asignado_a) {
      await this.notificar(
        updated.asignado_a,
        updated,
        "El usuario aprobó la solución y el ticket se cerró",
        "ESTADO_CAMBIADO"
      );
    }

    return updated;
  }

  async rechazar(id: string, usuario: UsuarioAutenticado): Promise<Ticket> {
    const ticket = await this.getTicketPermitido(id, usuario);
    this.verificarPropuestaDelCreador(ticket, usuario);

    const updated = await this.repository.updateEstado(id, EstadoTicket.En_proceso);

    await this.repository.crearHistorial({
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

  async obtenerHistorial(id: string, usuario: UsuarioAutenticado) {
    await this.getTicketPermitido(id, usuario);
    return this.repository.buscarHistorial(id);
  }

  async obtenerNotificaciones(usuario: UsuarioAutenticado, filtros: ListarNotificacionesQuery) {
    const [data, total, noLeidas] = await Promise.all([
      this.repository.buscarNotificaciones(usuario.id, {
        limite: filtros.limite,
        soloNoLeidas: filtros.no_leidas,
      }),
      this.repository.contarNotificaciones(usuario.id),
      this.repository.contarNotificaciones(usuario.id, true),
    ]);

    return { data, meta: { total, no_leidas: noLeidas } };
  }

  async marcarTodasLeidas(usuario: UsuarioAutenticado) {
    const { count } = await this.repository.marcarTodasLeidas(usuario.id);

    return count;
  }

  async marcarNotificacionLeida(id: string, usuario: UsuarioAutenticado): Promise<void> {
    const updated = await this.repository.marcarNotificacionLeida(id, usuario.id);

    if (!updated) {
      throw new ApiError(404, "No se ha encontrado la notificación");
    }
  }
}
