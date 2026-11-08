import type { Request, Response } from "express";
import { obtenerUsuario } from "@/utils/solicitud";

import { AnaliticasService } from "./analiticas.service";

const analiticasService = new AnaliticasService();

export class AnaliticasController {
  static async obtenerDashboard(req: Request, res: Response): Promise<void> {
    const usuario = obtenerUsuario(req);
    const dashboard = await analiticasService.obtenerDashboard(usuario);

    res.status(200).json({
      message: "Analíticas del dashboard obtenidas correctamente",
      data: dashboard,
    });
  }
}
