import type { Request, Response } from "express";

import { obtenerUsuario } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

import { listarAuditoriaQuerySchema } from "./auditoria.schema";
import { AuditoriaService } from "./auditoria.service";

const auditoriaService = new AuditoriaService();

export class AuditoriaController {
  static async listar(req: Request, res: Response) {
    const usuario = obtenerUsuario(req);
    const filtros = validar(
      listarAuditoriaQuerySchema,
      req.query,
      "Parámetros de consulta inválidos"
    );

    const resultado = await auditoriaService.listar(usuario.rol, filtros);

    return res.status(200).json({
      message: "Historial de auditoría",
      ...resultado,
    });
  }
}
