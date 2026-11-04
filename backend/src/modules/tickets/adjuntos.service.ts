import { randomUUID } from "node:crypto";
import { join } from "node:path";

import type { UsuarioAutenticado } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import { AdjuntosRepository } from "./adjuntos.repository";
import { puedeVerTicket } from "./tickets.permissions";
import { TicketRepository } from "./tickets.repository";

export class AdjuntosService {
  constructor(
    private readonly repository: AdjuntosRepository = new AdjuntosRepository(),
    private readonly ticketsRepository: TicketRepository = new TicketRepository()
  ) {}

  async crear(ticketId: string, usuario: UsuarioAutenticado, archivo?: Express.Multer.File) {
    if (!archivo) {
      throw new ApiError(400, "Adjunta una imagen");
    }

    const ticket = await this.ticketsRepository.buscarPorId(ticketId);

    if (!ticket) {
      throw new ApiError(404, "No se ha encontrado el ticket");
    }

    if (!puedeVerTicket(ticket, usuario)) {
      throw new ApiError(403, "No tienes acceso a este ticket");
    }

    const id = randomUUID();

    return this.repository.crear({
      id,
      ticket_id: ticket.id,
      nombre_original: archivo.originalname,
      nombre_almacenado: join("tickets", ticket.id, archivo.filename),
      tipo_mime: archivo.mimetype,
      ruta_url: `/api/v1/adjuntos/${id}`,
      subido_por_id: usuario.id,
    });
  }

  async obtenerParaDescarga(id: string, usuario: UsuarioAutenticado) {
    const adjunto = await this.repository.buscarPorId(id);

    if (!adjunto) {
      throw new ApiError(404, "No se ha encontrado el adjunto");
    }

    const visible = puedeVerTicket(
      {
        usuario_creador: { id: adjunto.ticket.usuario_creador_id },
        asignado_a: adjunto.ticket.asignado_a_id ? { id: adjunto.ticket.asignado_a_id } : null,
      },
      usuario
    );

    if (!visible) {
      throw new ApiError(403, "No tienes acceso a este adjunto");
    }

    return adjunto;
  }
}
