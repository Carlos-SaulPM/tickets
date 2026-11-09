import { redirect } from "next/navigation";

import { FormularioLogin } from "@/components/auth/formulario-login";
import { LimpiarSesionInvalida } from "@/components/auth/limpiar-sesion-invalida";
import { MarcaLogin } from "@/components/auth/marca-login";
import { NOMBRE_SISTEMA } from "@/lib/marca";
import { obtenerSesionServidor } from "@/lib/server/sesion";

export const instant = false;

export default async function LoginPage() {
  const sesion = await obtenerSesionServidor();

  if (sesion) {
    redirect("/tickets");
  }

  return (
    <main id="contenido" className="bg-background grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <LimpiarSesionInvalida />
      <h1 className="sr-only">Iniciar sesión en {NOMBRE_SISTEMA}</h1>

      <MarcaLogin variante="panel" />

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-6">
          <MarcaLogin variante="compacta" />
          <FormularioLogin />
        </div>
      </section>
    </main>
  );
}
