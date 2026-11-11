import type { Request, Response } from "express";

import { obtenerUsuario, requerirId } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

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

const ticketsService = new TicketsService();

const PARAMETROS_INVALIDOS = "Parámetros de consulta inválidos";

export class TicketsController {
  static async listar(req: Request, res: Response) {
    const filtros = validar(listarTicketsQuerySchema, req.query, PARAMETROS_INVALIDOS);

    const { tickets, meta } = await ticketsService.listar(obtenerUsuario(req), filtros);

    return res.status(200).json({
      message: "Lista de tickets",
      data: tickets,
      meta,
    });
  }

  static async obtenerPorId(req: Request, res: Response) {
    const id = requerirId(req.params);

    const ticket = await ticketsService.obtenerPorId(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Ticket encontrado",
      data: ticket,
    });
  }

  static async crear(req: Request, res: Response) {
    const datos = validar(crearTicketSchema, req.body);
    const ticket = await ticketsService.crear(datos, obtenerUsuario(req));

    return res.status(201).json({
      message: "Ticket creado",
      data: ticket,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const datos = validar(actualizarTicketSchema, req.body);
    const ticket = await ticketsService.actualizar(id, datos, obtenerUsuario(req));

    return res.status(200).json({
      message: "Ticket actualizado",
      data: ticket,
    });
  }

  static async asignar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const { asignado_a_id } = validar(asignarTicketSchema, req.body);
    const ticket = await ticketsService.asignar(id, asignado_a_id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Ticket asignado",
      data: ticket,
    });
  }

  static async cambiarEstado(req: Request, res: Response) {
    const id = requerirId(req.params);

    const { estado } = validar(cambiarEstadoSchema, req.body);
    const ticket = await ticketsService.cambiarEstado(id, estado, obtenerUsuario(req));

    return res.status(200).json({
      message: "Estado actualizado",
      data: ticket,
    });
  }

  static async obtenerMensajes(req: Request, res: Response) {
    const id = requerirId(req.params);

    const mensajes = await ticketsService.obtenerMensajes(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Mensajes del ticket",
      data: mensajes,
    });
  }

  static async agregarMensaje(req: Request, res: Response) {
    const id = requerirId(req.params);

    const datos = validar(crearMensajeSchema, req.body);
    const mensaje = await ticketsService.agregarMensaje(id, datos, obtenerUsuario(req));

    return res.status(201).json({
      message: "Mensaje creado",
      data: mensaje,
    });
  }

  static async aprobar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const ticket = await ticketsService.aprobar(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Solución aprobada",
      data: ticket,
    });
  }

  static async rechazar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const ticket = await ticketsService.rechazar(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Solución rechazada",
      data: ticket,
    });
  }

  static async obtenerHistorial(req: Request, res: Response) {
    const id = requerirId(req.params);

    const historial = await ticketsService.obtenerHistorial(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Historial del ticket",
      data: historial,
    });
  }

  static async obtenerNotificaciones(req: Request, res: Response) {
    const filtros = validar(listarNotificacionesQuerySchema, req.query, PARAMETROS_INVALIDOS);

    const { data, meta } = await ticketsService.obtenerNotificaciones(obtenerUsuario(req), filtros);

    return res.status(200).json({
      message: "Lista de notificaciones",
      data,
      meta,
    });
  }

  static async marcarTodasLasNotificacionesLeidas(req: Request, res: Response) {
    const actualizadas = await ticketsService.marcarTodasLeidas(obtenerUsuario(req));

    return res.status(200).json({
      message: "Notificaciones leídas",
      data: { actualizadas },
    });
  }

  static async marcarNotificacionLeida(req: Request, res: Response) {
    const id = requerirId(req.params);

    await ticketsService.marcarNotificacionLeida(id, obtenerUsuario(req));

    return res.status(200).json({
      message: "Notificación leída",
    });
  }
}
