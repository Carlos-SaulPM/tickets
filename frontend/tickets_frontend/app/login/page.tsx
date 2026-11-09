import { redirect } from "next/navigation";

import { FormularioLogin } from "@/components/auth/formulario-login";
import { LimpiarSesionInvalida } from "@/components/auth/limpiar-sesion-invalida";
import { MarcaLogin } from "@/components/auth/marca-login";
import { obtenerSesionServidor } from "@/lib/server/sesion";

export const instant = false;

export const metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string | string[] }>;
}) {
  const sesion = await obtenerSesionServidor();

  if (sesion) {
    redirect("/tickets");
  }

  const { motivo } = await searchParams;

  return (
    <main id="contenido" className="bg-muted grid min-h-dvh lg:grid-cols-[20rem_1fr]">
      <LimpiarSesionInvalida />

      <MarcaLogin variante="panel" />

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-6">
          <MarcaLogin variante="compacta" />
          <FormularioLogin motivo={typeof motivo === "string" ? motivo : undefined} />
        </div>
      </section>
    </main>
  );
}
