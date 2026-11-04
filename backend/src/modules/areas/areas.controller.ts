import type { Request, Response } from "express";
import { z } from "zod";

import { actualizarAreaSchema, areasQuerySchema, crearAreaSchema } from "./areas.schema";
import { AreasService } from "./areas.service";

const areasService = new AreasService();

const getAreaId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

const parseActivo = (valor: "true" | "false" | "all") =>
  valor === "all" ? undefined : valor === "true";

export class AreasController {
  static async listar(req: Request, res: Response) {
    const validation = areasQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        error: "Parámetros de consulta inválidos",
        issues: validation.error.issues,
      });
    }

    const areas = await areasService.listar(parseActivo(validation.data.activo));

    return res.status(200).json({
      message: "Áreas obtenidas con éxito",
      data: areas,
    });
  }

  static async crear(req: Request, res: Response) {
    const validation = crearAreaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const area = await areasService.crear(validation.data, req.usuario?.rol);

    return res.status(201).json({
      message: "Área creada correctamente",
      data: area,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = getAreaId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = actualizarAreaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const area = await areasService.actualizar(id, validation.data, req.usuario?.rol);

    return res.status(200).json({
      message: "Área actualizada correctamente",
      data: area,
    });
  }
}
