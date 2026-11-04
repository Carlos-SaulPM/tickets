import type { Request, Response } from "express";

import { rutaAbsoluta } from "@/config/uploads";

import { AdjuntosService } from "./adjuntos.service";
import { obtenerId, obtenerUsuario } from "./tickets.utils";

const adjuntosService = new AdjuntosService();

export class AdjuntosController {
  static async subir(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const adjunto = await adjuntosService.crear(id, obtenerUsuario(req), req.file);

    return res.status(201).json({
      message: "Imagen adjuntada correctamente",
      data: adjunto,
    });
  }

  static async descargar(req: Request, res: Response) {
    const id = obtenerId(req.params);

    if (!id) {
      return res.status(400).json({ error: "El id no es válido o no existe" });
    }

    const adjunto = await adjuntosService.obtenerParaDescarga(id, obtenerUsuario(req));

    res.setHeader("Content-Type", adjunto.tipo_mime ?? "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(adjunto.nombre_original)}"`
    );
    res.setHeader("Cache-Control", "private, max-age=300");

    res.sendFile(rutaAbsoluta(adjunto.nombre_almacenado));
    return;
  }
}
