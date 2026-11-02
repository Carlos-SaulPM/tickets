import { Router } from "express";

import { rutasAutenticacion } from "@/modules/autenticacion/autenticacion.routes";
import { rutasHolamundo } from "@/modules/holamundo/holamundo.routes";

export const apiRouter = Router();

apiRouter.use("/holamundo", rutasHolamundo);
apiRouter.use("/autenticacion", rutasAutenticacion);
