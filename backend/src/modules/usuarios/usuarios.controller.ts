import type { Request, Response } from "express";
import { z } from "zod";

import { actualizarUsuarioSchema, crearUsuarioSchema } from "./usuarios.schema";
import { UsuariosService } from "./usuarios.service";

const userService = new UsuariosService();

const getUserId = (params: Request["params"]) => {
  const id = params.id;
  return typeof id === "string" && z.uuid().safeParse(id).success ? id : null;
};

export class UsuariosController {
  static async crear(req: Request, res: Response) {
    const validation = crearUsuarioSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const result = await userService.crearUsuario({
      data: validation.data,
      requestedRole: req.usuario?.rol,
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      data: result,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = getUserId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const validation = actualizarUsuarioSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        issues: validation.error.issues,
      });
    }

    const updatedUser = await userService.actualizarUsuario({
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

  static async eliminar(req: Request, res: Response) {
    const id = getUserId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    await userService.eliminar({
      id,
      requestedRole: req.usuario?.rol,
      requestedUserId: req.usuario?.id,
    });

    return res.status(200).json({
      message: "Usuario dado de baja correctamente",
    });
  }

  static async listar(req: Request, res: Response) {
    const usuarios = await userService.listar(req.usuario?.rol);

    return res.status(200).json({
      message: "Usuarios obtenidos con éxito",
      data: usuarios,
    });
  }

  static async obtenerPorId(req: Request, res: Response) {
    const id = getUserId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const usuario = await userService.obtenerPorId(id, req.usuario?.rol);

    return res.status(200).json({
      message: "Se ha recuperado el usuario correctamente",
      data: usuario,
    });
  }
}
