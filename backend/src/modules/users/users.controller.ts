import type { Request, Response } from "express";

import { ApiError } from "@/utils/api-error";

import { createUserSchema, updateUserSchema } from "./users.schema";
import { UsersService } from "./users.service";

const userService = new UsersService();

export class usersController {
  static async create(req: Request, res: Response) {
    try {
      const requestedRole = req.headers["x-user-role"] as any;
      const validation = createUserSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Datos de entrada inválidos",
          errors: validation.error.issues,
        });
      }

      const result = await userService.createUser({
        data: validation.data,
        requestedRole,
      });

      return res.status(201).json({
        message: "usuario creado correctamente",
        data: result,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const requestedRole = req.headers["x-user-role"] as any;
      const { id } = req.params;

      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          message: "El id no es válido o no existe",
        });
      }

      const validation = updateUserSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "datos inválidos",
          errors: validation.error.issues,
        });
      }

      const updatedUser = await userService.editUser({
        id,
        data: validation.data,
        requestedRole,
      });

      return res.status(200).json({
        message: "Usuario actualizado exitosamente",
        data: updatedUser,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const requestedRole = req.headers["x-user-role"] as any;

      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          message: "El id no es válido o no existe",
        });
      }

      await userService.safeDelete({ id, requestedRole });

      return res.status(200).json({
        message: "Usuario dado de baja (safe delete) correctamente",
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const requestedRole = req.headers["x-user-role"] as any;
      const usuarios = await userService.getAll(requestedRole);

      return res.status(200).json({
        message: "Usuarios obtenidos con éxito",
        data: usuarios,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  }
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const requestedRole = req.headers["x-user-role"] as any;

      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          message: "El id no es válido o no existe",
        });
      }

      const usuario = await userService.getById(id, requestedRole);

      return res.status(200).json({
        message: "Se ha recuperado el usuario correctamente",
        data: usuario,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        return res.status(error.status).json({
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  }
}
