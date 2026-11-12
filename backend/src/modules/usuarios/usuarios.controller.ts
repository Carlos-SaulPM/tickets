import type { Request, Response } from "express";

import { requerirId } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

import { actualizarUsuarioSchema, crearUsuarioSchema } from "./usuarios.schema";
import { UsuariosService } from "./usuarios.service";

const usuariosService = new UsuariosService();

export class UsuariosController {
  static async crear(req: Request, res: Response) {
    const datos = validar(crearUsuarioSchema, req.body);

    const resultado = await usuariosService.crearUsuario({
      data: datos,
      rolSolicitante: req.usuario?.rol,
    });

    return res.status(201).json({
      message: "Usuario creado",
      data: resultado,
    });
  }

  static async actualizar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const datos = validar(actualizarUsuarioSchema, req.body);

    const usuario = await usuariosService.actualizarUsuario({
      id,
      data: datos,
      rolSolicitante: req.usuario?.rol,
      idSolicitante: req.usuario?.id,
    });

    return res.status(200).json({
      message: "Usuario actualizado",
      data: usuario,
    });
  }

  static async restablecerContrasena(req: Request, res: Response) {
    const id = requerirId(req.params);

    const resultado = await usuariosService.restablecerContrasena({
      id,
      rolSolicitante: req.usuario?.rol,
    });

    return res.status(200).json({
      message: "Contraseña restablecida",
      data: resultado,
    });
  }

  static async eliminar(req: Request, res: Response) {
    const id = requerirId(req.params);

    await usuariosService.eliminar({
      id,
      rolSolicitante: req.usuario?.rol,
      idSolicitante: req.usuario?.id,
    });

    return res.status(200).json({
      message: "Usuario dado de baja",
    });
  }

  static async listar(req: Request, res: Response) {
    const usuarios = await usuariosService.listar(req.usuario?.rol);

    return res.status(200).json({
      message: "Lista de usuarios",
      data: usuarios,
    });
  }

  static async obtenerPorId(req: Request, res: Response) {
    const id = requerirId(req.params);

    const usuario = await usuariosService.obtenerPorId(id, req.usuario?.rol);

    return res.status(200).json({
      message: "Usuario encontrado",
      data: usuario,
    });
  }
}
