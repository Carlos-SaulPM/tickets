import type { Request, Response } from "express";

import { requerirId } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

import {
  actualizarCategoriaSchema,
  categoriasQuerySchema,
  crearCategoriaSchema,
} from "./categorias.schema";
import { CategoriasService } from "./categorias.service";

const categoriasService = new CategoriasService();

const parseActivo = (valor: "true" | "false" | "all") =>
  valor === "all" ? undefined : valor === "true";

export class CategoriasController {
  static async listar(req: Request, res: Response) {
    const { activo } = validar(
      categoriasQuerySchema,
      req.query,
      "Parámetros de consulta inválidos"
    );

    const categorias = await categoriasService.listar(parseActivo(activo));

    return res.status(200).json({
      message: "Lista de categorías",
      data: categorias,
    });
  }

  static async crear(req: Request, res: Response) {
    const datos = validar(crearCategoriaSchema, req.body);

    const categoria = await categoriasService.crear(datos, req.usuario?.rol, req.usuario?.id);

    return res.status(201).json({
      message: "Categoría creada",
      data: categoria,
    });
  }

  static async eliminar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const categoria = await categoriasService.eliminar(id, req.usuario?.rol, req.usuario?.id);

    return res.status(200).json({
      message: "Categoría eliminada",
      data: categoria,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const datos = validar(actualizarCategoriaSchema, req.body);

    const categoria = await categoriasService.actualizar(
      id,
      datos,
      req.usuario?.rol,
      req.usuario?.id
    );

    return res.status(200).json({
      message: "Categoría actualizada",
      data: categoria,
    });
  }
}
