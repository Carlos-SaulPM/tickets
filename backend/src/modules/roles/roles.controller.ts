import type { Request, Response } from "express";

import { exigirAdministrador } from "@/utils/permisos";

import { RolesService } from "./roles.service";

const rolesService = new RolesService();

export class RolesController {
  static async listar(req: Request, res: Response) {
    exigirAdministrador(req.usuario?.rol);

    const roles = await rolesService.listar();

    return res.status(200).json({
      message: "Roles obtenidos con éxito",
      data: roles,
    });
  }
}
