import type { Request, Response } from "express";
import { z } from "zod";

import { createAreaSchema, updateAreaSchema } from "./areas.schema";
import { AreasService } from "./areas.service";

const areasService = new AreasService();

const getAreaId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export class AreasController {
  static async getAll(_req: Request, res: Response) {
    const areas = await areasService.getAll();

    return res.status(200).json({
      message: "Áreas obtenidas con éxito",
      data: areas,
    });
  }

  static async create(req: Request, res: Response) {
    const validation = createAreaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const area = await areasService.create(validation.data, req.usuario?.rol);

    return res.status(201).json({
      message: "Área creada correctamente",
      data: area,
    });
  }

  static async update(req: Request, res: Response) {
    const id = getAreaId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = updateAreaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const area = await areasService.update(id, validation.data, req.usuario?.rol);

    return res.status(200).json({
      message: "Área actualizada correctamente",
      data: area,
    });
  }
}
