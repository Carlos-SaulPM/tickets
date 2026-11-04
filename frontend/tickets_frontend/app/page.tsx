import { redirect } from "next/navigation";

import { obtenerSesionServidor } from "@/lib/server/sesion";

export const instant = false;

export default async function Home() {
  const sesion = await obtenerSesionServidor();

  redirect(sesion ? "/tickets" : "/login");
}
