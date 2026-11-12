import type { Request, Response } from "express";

import { requerirId } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

import { actualizarAreaSchema, areasQuerySchema, crearAreaSchema } from "./areas.schema";
import { AreasService } from "./areas.service";

const areasService = new AreasService();

const parseActivo = (valor: "true" | "false" | "all") =>
  valor === "all" ? undefined : valor === "true";

export class AreasController {
  static async listar(req: Request, res: Response) {
    const { activo } = validar(areasQuerySchema, req.query, "Parámetros de consulta inválidos");

    const areas = await areasService.listar(parseActivo(activo));

    return res.status(200).json({
      message: "Lista de áreas",
      data: areas,
    });
  }

  static async crear(req: Request, res: Response) {
    const datos = validar(crearAreaSchema, req.body);

    const area = await areasService.crear(datos, req.usuario?.rol, req.usuario?.id);

    return res.status(201).json({
      message: "Área creada",
      data: area,
    });
  }

  static async eliminar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const area = await areasService.eliminar(id, req.usuario?.rol, req.usuario?.id);

    return res.status(200).json({
      message: "Área eliminada",
      data: area,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const datos = validar(actualizarAreaSchema, req.body);

    const area = await areasService.actualizar(id, datos, req.usuario?.rol, req.usuario?.id);

    return res.status(200).json({
      message: "Área actualizada",
      data: area,
    });
  }
}
