import { Router } from "express";

import { rutasHolamundo } from "@/modules/holamundo/holamundo.routes";
import usersRouter from "@/modules/users/users.routes";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);

apiRouter.use("/holamundo", rutasHolamundo);
