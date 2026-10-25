import { Router } from "express";

import { rutasHolamundo } from "@/modules/holamundo/holamundo.routes";

export const apiRouter = Router();

apiRouter.use("/holamundo", rutasHolamundo);
