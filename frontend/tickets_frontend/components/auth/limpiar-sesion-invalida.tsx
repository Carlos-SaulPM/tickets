"use client";

import { useEffect } from "react";

import { limpiarSesion, obtenerSesion } from "@/lib/sesion";

export function LimpiarSesionInvalida() {
  useEffect(() => {
    if (obtenerSesion()) limpiarSesion();
  }, []);

  return null;
}
