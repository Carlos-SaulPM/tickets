import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { env } from "@/config/env";
import { ApiError } from "@/utils/api-error";

export const TAMANO_MAXIMO_ADJUNTO = 5 * 1024 * 1024;

const EXTENSIONES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const rutaAbsoluta = (relativa: string) => resolve(env.UPLOADS_DIR, relativa);

const almacenamiento = multer.diskStorage({
  destination: (req, _archivo, callback) => {
    const id = req.params.id;
    const ticketId = typeof id === "string" ? id : "sin-ticket";
    const destino = rutaAbsoluta(join("tickets", ticketId));

    mkdirSync(destino, { recursive: true });
    callback(null, destino);
  },
  filename: (_req, archivo, callback) => {
    callback(null, `${randomUUID()}${EXTENSIONES[archivo.mimetype] ?? ""}`);
  },
});

const subida = multer({
  storage: almacenamiento,
  limits: { fileSize: TAMANO_MAXIMO_ADJUNTO, files: 1 },
  fileFilter: (_req, archivo, callback) => {
    if (!EXTENSIONES[archivo.mimetype]) {
      callback(new ApiError(400, "Solo se permiten imágenes PNG, JPEG, WebP o GIF"));
      return;
    }

    callback(null, true);
  },
});

const recibirArchivo = subida.single("archivo");

export const recibirAdjunto = (req: Request, res: Response, next: NextFunction) => {
  recibirArchivo(req, res, error => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const mensaje =
        error.code === "LIMIT_FILE_SIZE"
          ? "La imagen supera el límite de 5 MB"
          : `No se pudo subir la imagen: ${error.message}`;

      next(new ApiError(400, mensaje));
      return;
    }

    next(error);
  });
};
