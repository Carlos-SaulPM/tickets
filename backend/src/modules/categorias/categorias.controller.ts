import type { Request, Response } from "express";

import { requerirId } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

import { actualizarCategoriaSchema, crearCategoriaSchema } from "./categorias.schema";
import { CategoriasService } from "./categorias.service";

const categoriasService = new CategoriasService();

export class CategoriasController {
  static async listar(_req: Request, res: Response) {
    const categorias = await categoriasService.listar();

    return res.status(200).json({
      message: "Lista de categorías",
      data: categorias,
    });
  }

  static async crear(req: Request, res: Response) {
    const datos = validar(crearCategoriaSchema, req.body);

    const categoria = await categoriasService.crear(datos, req.usuario?.rol);

    return res.status(201).json({
      message: "Categoría creada",
      data: categoria,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const datos = validar(actualizarCategoriaSchema, req.body);

    const categoria = await categoriasService.actualizar(id, datos, req.usuario?.rol);

    return res.status(200).json({
      message: "Categoría actualizada",
      data: categoria,
    });
  }
}
