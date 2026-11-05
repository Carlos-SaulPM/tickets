import type { PaginaNotificaciones } from "@/types/notificacion.types";

import { fetchConSesion } from "./api";

const LIMITE = 50;

export const obtenerNotificaciones = (noLeidas: boolean) =>
  fetchConSesion<PaginaNotificaciones>(
    `/notificaciones?limite=${LIMITE}${noLeidas ? "&no_leidas=true" : ""}`
  );
