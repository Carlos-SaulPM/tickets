import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parsearSesion, SESSION_COOKIE } from "@/lib/sesion";

export const obtenerSesionServidor = async () => {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!raw) return null;

  try {
    return parsearSesion(decodeURIComponent(raw));
  } catch {
    return parsearSesion(raw);
  }
};

export const requerirSesion = async () => {
  const sesion = await obtenerSesionServidor();

  if (!sesion) {
    redirect("/login");
  }

  return sesion;
};
