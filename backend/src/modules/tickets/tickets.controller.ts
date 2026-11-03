import type { Request, Response } from "express";
import { z } from "zod";

import { ApiError } from "@/utils/api-error";

import {
  assignTicketSchema,
  createMensajeSchema,
  createTicketSchema,
  updateTicketSchema,
} from "./tickets.schema";
import { TicketsService } from "./tickets.service";

const ticketsService = new TicketsService();

const getUser = (req: Request) => {
  if (!req.usuario) {
    throw new ApiError(401, "No autorizado");
  }

  return req.usuario;
};

const getTicketId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export class TicketsController {
  static async getAll(req: Request, res: Response) {
    const tickets = await ticketsService.getAll(getUser(req));

    return res.status(200).json({
      message: "Tickets obtenidos con éxito",
      data: tickets,
    });
  }

  static async getById(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const ticket = await ticketsService.getById(id, getUser(req));

    return res.status(200).json({
      message: "Ticket obtenido con éxito",
      data: ticket,
    });
  }

  static async create(req: Request, res: Response) {
    const validation = createTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.create(validation.data, getUser(req));

    return res.status(201).json({
      message: "Ticket creado correctamente",
      data: ticket,
    });
  }

  static async update(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = updateTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.update(id, validation.data, getUser(req));

    return res.status(200).json({
      message: "Ticket actualizado correctamente",
      data: ticket,
    });
  }

  static async assign(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = assignTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.assign(id, validation.data.asignado_a_id, getUser(req));

    return res.status(200).json({
      message: "Ticket asignado correctamente",
      data: ticket,
    });
  }

  static async getMensajes(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const mensajes = await ticketsService.getMensajes(id, getUser(req));

    return res.status(200).json({
      message: "Mensajes obtenidos con éxito",
      data: mensajes,
    });
  }

  static async addMensaje(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = createMensajeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const mensaje = await ticketsService.addMensaje(id, validation.data, getUser(req));

    return res.status(201).json({
      message: "Mensaje creado correctamente",
      data: mensaje,
    });
  }

  static async aprobar(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const ticket = await ticketsService.aprobar(id, getUser(req));

    return res.status(200).json({
      message: "Solución aprobada correctamente",
      data: ticket,
    });
  }

  static async rechazar(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const ticket = await ticketsService.rechazar(id, getUser(req));

    return res.status(200).json({
      message: "Solución rechazada correctamente",
      data: ticket,
    });
  }

  static async getHistorial(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const historial = await ticketsService.getHistorial(id, getUser(req));

    return res.status(200).json({
      message: "Historial obtenido con éxito",
      data: historial,
    });
  }

  static async getNotificaciones(req: Request, res: Response) {
    const notificaciones = await ticketsService.getNotificaciones(getUser(req));

    return res.status(200).json({
      message: "Notificaciones obtenidas con éxito",
      data: notificaciones,
    });
  }

  static async marcarNotificacionLeida(req: Request, res: Response) {
    const id = getTicketId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    await ticketsService.marcarNotificacionLeida(id, getUser(req));

    return res.status(200).json({
      message: "Notificación marcada como leída",
    });
  }
}
