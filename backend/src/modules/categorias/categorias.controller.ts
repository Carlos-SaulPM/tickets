import type { Request, Response } from "express";
import { z } from "zod";

import { createCategoriaSchema, updateCategoriaSchema } from "./categorias.schema";
import { CategoriasService } from "./categorias.service";

const categoriasService = new CategoriasService();

const getCategoriaId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export class CategoriasController {
  static async getAll(_req: Request, res: Response) {
    const categorias = await categoriasService.getAll();

    return res.status(200).json({
      message: "Categorías obtenidas con éxito",
      data: categorias,
    });
  }

  static async create(req: Request, res: Response) {
    const validation = createCategoriaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const categoria = await categoriasService.create(validation.data, req.usuario?.rol);

    return res.status(201).json({
      message: "Categoría creada correctamente",
      data: categoria,
    });
  }

  static async update(req: Request, res: Response) {
    const id = getCategoriaId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = updateCategoriaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const categoria = await categoriasService.update(id, validation.data, req.usuario?.rol);

    return res.status(200).json({
      message: "Categoría actualizada correctamente",
      data: categoria,
    });
  }
}
