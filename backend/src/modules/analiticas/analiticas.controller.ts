import type { Request, Response } from "express";

import { obtenerUsuario } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

import { dashboardQuerySchema } from "./analiticas.schema";
import { AnaliticasService } from "./analiticas.service";

const analiticasService = new AnaliticasService();

export class AnaliticasController {
  static async obtenerDashboard(req: Request, res: Response): Promise<void> {
    const usuario = obtenerUsuario(req);
    const filtros = validar(dashboardQuerySchema, req.query, "Parámetros de consulta inválidos");

    const dashboard = await analiticasService.obtenerDashboard(usuario, filtros);

    res.status(200).json({
      message: "Analíticas del dashboard",
      data: dashboard,
    });
  }
}
