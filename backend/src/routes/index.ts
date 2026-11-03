import { Router } from "express";

import { rutasAutenticacion } from "@/modules/autenticacion/autenticacion.routes";
import { rutasHolamundo } from "@/modules/holamundo/holamundo.routes";
import rolesRouter from "@/modules/roles/roles.routes";
import usersRouter from "@/modules/users/users.routes";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/roles", rolesRouter);

apiRouter.use("/holamundo", rutasHolamundo);
apiRouter.use("/autenticacion", rutasAutenticacion);
