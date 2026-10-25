import type { Request, Response } from "express";

export const obtenerHolaMundo = (_req: Request, res: Response): void => {
  res.status(200).json({ mensaje: "Hola Mundo" });
};
