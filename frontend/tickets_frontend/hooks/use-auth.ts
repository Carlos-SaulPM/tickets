"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  obtenerSnapshotSesion,
  obtenerSnapshotSesionServidor,
  parsearSesion,
  suscribirSesion,
} from "@/lib/sesion";

const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const useAuth = () => {
  const snapshot = useSyncExternalStore(
    suscribirSesion,
    obtenerSnapshotSesion,
    obtenerSnapshotSesionServidor
  );

  const isClient = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const sesion = useMemo(() => parsearSesion(snapshot), [snapshot]);

  return { sesion, isClient };
};
