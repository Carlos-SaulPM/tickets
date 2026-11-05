import type { Request, Response } from "express";

import {
  actualizarTicketSchema,
  asignarTicketSchema,
  cambiarEstadoSchema,
  crearMensajeSchema,
  crearTicketSchema,
  listarNotificacionesQuerySchema,
  listarTicketsQuerySchema,
} from "./tickets.schema";
import { TicketsService } from "./tickets.service";
import { obtenerId, obtenerUsuario } from "./tickets.utils";

const ticketsService = new TicketsService();

export class TicketsController {
  static async listar(req: Request, res: Response) {
    const validation = listarTicketsQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        error: "Parámetros de consulta inválidos",
        issues: validation.error.issues,
      });
    }

    const { tickets, meta } = await ticketsService.listar(obtenerUsuario(req), validation.data);

    return res.status(200).json({
      message: "Tickets obtenidos con éxito",
      data: tickets,
      meta,
    });
  }

  static async obtenerPorId(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const ticket = await ticketsService.obtenerPorId(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Ticket obtenido con éxito",
      data: ticket,
    });
  }

  static async crear(req: Request, res: Response) {
    const validation = crearTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.crear(validation.data, obtenerUsuario(req));

    return res.status(201).json({
      message: "Ticket creado correctamente",
      data: ticket,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = actualizarTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.actualizar(id, validation.data, obtenerUsuario(req));

    return res.status(200).json({
      message: "Ticket actualizado correctamente",
      data: ticket,
    });
  }

  static async asignar(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = asignarTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.asignar(
      id,
      validation.data.asignado_a_id,
      obtenerUsuario(req)
    );

    return res.status(200).json({
      message: "Ticket asignado correctamente",
      data: ticket,
    });
  }

  static async cambiarEstado(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = cambiarEstadoSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const ticket = await ticketsService.cambiarEstado(
      id,
      validation.data.estado,
      obtenerUsuario(req)
    );

    return res.status(200).json({
      message: "Estado del ticket actualizado correctamente",
      data: ticket,
    });
  }

  static async obtenerMensajes(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const mensajes = await ticketsService.obtenerMensajes(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Mensajes obtenidos con éxito",
      data: mensajes,
    });
  }

  static async agregarMensaje(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = crearMensajeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const mensaje = await ticketsService.agregarMensaje(id, validation.data, obtenerUsuario(req));

    return res.status(201).json({
      message: "Mensaje creado correctamente",
      data: mensaje,
    });
  }

  static async aprobar(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const ticket = await ticketsService.aprobar(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Solución aprobada correctamente",
      data: ticket,
    });
  }

  static async rechazar(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const ticket = await ticketsService.rechazar(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Solución rechazada correctamente",
      data: ticket,
    });
  }

  static async obtenerHistorial(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const historial = await ticketsService.obtenerHistorial(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Historial obtenido con éxito",
      data: historial,
    });
  }

  static async obtenerNotificaciones(req: Request, res: Response) {
    const validation = listarNotificacionesQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        error: "Parámetros de consulta inválidos",
        issues: validation.error.issues,
      });
    }

    const { data, meta } = await ticketsService.obtenerNotificaciones(
      obtenerUsuario(req),
      validation.data
    );

    return res.status(200).json({
      message: "Notificaciones obtenidas con éxito",
      data,
      meta,
    });
  }

  static async marcarTodasLasNotificacionesLeidas(req: Request, res: Response) {
    const actualizadas = await ticketsService.marcarTodasLeidas(obtenerUsuario(req));

    return res.status(200).json({
      message: "Notificaciones marcadas como leídas",
      data: { actualizadas },
    });
  }

  static async marcarNotificacionLeida(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    await ticketsService.marcarNotificacionLeida(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Notificación marcada como leída",
    });
  }
}
