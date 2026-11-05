import type { Request, Response } from "express";

import { rutaAbsoluta } from "@/config/uploads";
import { obtenerUsuario, requerirId } from "@/utils/solicitud";

import { AdjuntosService } from "./adjuntos.service";

const adjuntosService = new AdjuntosService();

export class AdjuntosController {
  static async subir(req: Request, res: Response) {
    const id = requerirId(req.params);

    const adjunto = await adjuntosService.crear(id, obtenerUsuario(req), req.file);

    return res.status(201).json({
      message: "Imagen adjuntada correctamente",
      data: adjunto,
    });
  }

  static async descargar(req: Request, res: Response) {
    const id = requerirId(req.params);

    const adjunto = await adjuntosService.obtenerParaDescarga(id, obtenerUsuario(req));

    res.setHeader("Content-Type", adjunto.tipo_mime ?? "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(adjunto.nombre_original)}"`
    );
    res.setHeader("Cache-Control", "private, max-age=300");

    res.sendFile(rutaAbsoluta(adjunto.nombre_almacenado));
  }
}
