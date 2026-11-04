import { Router } from "express";

import areasRouter from "@/modules/areas/areas.routes";
import { rutasAutenticacion } from "@/modules/autenticacion/autenticacion.routes";
import categoriasRouter from "@/modules/categorias/categorias.routes";
import { rutasHolamundo } from "@/modules/holamundo/holamundo.routes";
import rolesRouter from "@/modules/roles/roles.routes";
import adjuntosRouter from "@/modules/tickets/adjuntos.routes";
import notificacionesRouter from "@/modules/tickets/notificaciones.routes";
import ticketsRouter from "@/modules/tickets/tickets.routes";
import usersRouter from "@/modules/usuarios/usuarios.routes";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/areas", areasRouter);
apiRouter.use("/categorias", categoriasRouter);
apiRouter.use("/tickets", ticketsRouter);
apiRouter.use("/notificaciones", notificacionesRouter);
apiRouter.use("/adjuntos", adjuntosRouter);

apiRouter.use("/holamundo", rutasHolamundo);
apiRouter.use("/autenticacion", rutasAutenticacion);
