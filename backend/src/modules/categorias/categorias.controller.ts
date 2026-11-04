import type { Request, Response } from "express";
import { z } from "zod";

import { actualizarCategoriaSchema, crearCategoriaSchema } from "./categorias.schema";
import { CategoriasService } from "./categorias.service";

const categoriasService = new CategoriasService();

const getCategoriaId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export class CategoriasController {
  static async listar(_req: Request, res: Response) {
    const categorias = await categoriasService.listar();

    return res.status(200).json({
      message: "Categorías obtenidas con éxito",
      data: categorias,
    });
  }

  static async crear(req: Request, res: Response) {
    const validation = crearCategoriaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const categoria = await categoriasService.crear(validation.data, req.usuario?.rol);

    return res.status(201).json({
      message: "Categoría creada correctamente",
      data: categoria,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = getCategoriaId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = actualizarCategoriaSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const categoria = await categoriasService.actualizar(id, validation.data, req.usuario?.rol);

    return res.status(200).json({
      message: "Categoría actualizada correctamente",
      data: categoria,
    });
  }
}
