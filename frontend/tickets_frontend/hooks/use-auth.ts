"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  obtenerSnapshotSesion,
  obtenerSnapshotSesionServidor,
  parsearSesion,
  suscribirSesion,
} from "@/lib/sesion";

const suscribirNada = () => () => undefined;
const siempreCliente = () => true;
const siempreServidor = () => false;

export const useAuth = () => {
  const snapshot = useSyncExternalStore(
    suscribirSesion,
    obtenerSnapshotSesion,
    obtenerSnapshotSesionServidor
  );

  const isClient = useSyncExternalStore(suscribirNada, siempreCliente, siempreServidor);

  const sesion = useMemo(() => parsearSesion(snapshot), [snapshot]);

  return { sesion, isClient };
};
