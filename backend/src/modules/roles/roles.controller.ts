import type { Request, Response } from "express";

import { ApiError } from "@/utils/api-error";

import { RolesService } from "./roles.service";

const rolesService = new RolesService();

export class RolesController {
  static async getAll(req: Request, res: Response) {
    if (req.usuario?.rol !== "Administrador") {
      throw new ApiError(403, "Acceso denegado: Solo permitido para administrador");
    }

    const roles = await rolesService.getAll();

    return res.status(200).json({
      message: "Roles obtenidos con éxito",
      data: roles,
    });
  }
}
