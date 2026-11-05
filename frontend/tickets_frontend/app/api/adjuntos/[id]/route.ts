import { cookies } from "next/headers";

import { SERVER_API_BASE_URL } from "@/lib/server/api";
import { parsearSesion, SESSION_COOKIE } from "@/lib/sesion";

export async function GET(_peticion: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const valor = (await cookies()).get(SESSION_COOKIE)?.value;
  const sesion = valor ? parsearSesion(decodeURIComponent(valor)) : null;

  if (!sesion) {
    return new Response("No autorizado", { status: 401 });
  }

  const respuesta = await fetch(`${SERVER_API_BASE_URL}/adjuntos/${id}`, {
    headers: { Authorization: `Bearer ${sesion.token}` },
    cache: "no-store",
  });

  if (!respuesta.ok) {
    return new Response("No se pudo obtener el adjunto", { status: respuesta.status });
  }

  return new Response(respuesta.body, {
    status: 200,
    headers: {
      "Content-Type": respuesta.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
