import type { Request, Response } from "express";
import { z } from "zod";

import { createUserSchema, updateUserSchema } from "./users.schema";
import { UsersService } from "./users.service";

const userService = new UsersService();

const getUserId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export class UsersController {
  static async create(req: Request, res: Response) {
    const validation = createUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const result = await userService.createUser({
      data: validation.data,
      requestedRole: req.usuario?.rol,
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      data: result,
    });
  }

  static async update(req: Request, res: Response) {
    const id = getUserId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const updatedUser = await userService.editUser({
      id,
      data: validation.data,
      requestedRole: req.usuario?.rol,
      requestedUserId: req.usuario?.id,
    });

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      data: updatedUser,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = getUserId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    await userService.safeDelete({
      id,
      requestedRole: req.usuario?.rol,
      requestedUserId: req.usuario?.id,
    });

    return res.status(200).json({
      message: "Usuario dado de baja correctamente",
    });
  }

  static async getAll(req: Request, res: Response) {
    const usuarios = await userService.getAll(req.usuario?.rol);

    return res.status(200).json({
      message: "Usuarios obtenidos con éxito",
      data: usuarios,
    });
  }

  static async getById(req: Request, res: Response) {
    const id = getUserId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const usuario = await userService.getById(id, req.usuario?.rol);

    return res.status(200).json({
      message: "Se ha recuperado el usuario correctamente",
      data: usuario,
    });
  }
}
