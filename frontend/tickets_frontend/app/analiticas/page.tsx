import { Navbar } from "@/components/layout/navbar";
import { TarjetasMetricas } from "@/components/analiticas/tarjetas-metricas";
import { GraficasDashboard } from "@/components/analiticas/graficas-dashboard";
import { BotonExportarPdf } from "@/components/analiticas/boton-exportar-pdf";
import { obtenerAnaliticasDashboard } from "@/lib/server/analiticas";
import { requerirSesion } from "@/lib/server/sesion";

export const instant = false;

export default async function AnaliticasPage() {
  await requerirSesion();

  const data = await obtenerAnaliticasDashboard();

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Analíticas</h1>
            <p className="text-muted-foreground text-sm">
              Métricas generales sobre el desempeño del sistema de tickets y usuarios.
            </p>
          </div>

          <BotonExportarPdf data={data} />
        </header>

        <TarjetasMetricas data={data} />
        <GraficasDashboard data={data} />
      </main>
    </div>
  );
}