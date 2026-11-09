"use client";

import { useEffect } from "react";

import { limpiarSesion, obtenerSesion } from "@/lib/sesion";

/**
 * El login solo se renderiza cuando el servidor no ve la cookie de sesión.
 * Si el cliente aún conserva una sesión en localStorage, está muerta: se limpia.
 */
export function LimpiarSesionInvalida() {
  useEffect(() => {
    if (obtenerSesion()) limpiarSesion();
  }, []);

  return null;
}
