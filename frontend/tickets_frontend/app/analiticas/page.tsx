import { BotonExportarPdf } from "@/components/analiticas/boton-exportar-pdf";
import { CargaSoportes } from "@/components/analiticas/carga-soportes";
import { FiltrosAnaliticas } from "@/components/analiticas/filtros-analiticas";
import { GraficasDashboard } from "@/components/analiticas/graficas-dashboard";
import { TarjetasMetricas } from "@/components/analiticas/tarjetas-metricas";
import { Navbar } from "@/components/layout/navbar";
import {
  obtenerAnaliticasDashboard,
  type FiltrosAnaliticas as Filtros,
} from "@/lib/server/analiticas";
import { obtenerAreasTodas, obtenerCategoriasTodas } from "@/lib/server/catalogos";
import { requerirSesion } from "@/lib/server/sesion";
import { obtenerUsuarios } from "@/lib/server/usuarios";
import type { Usuario } from "@/types/usuario.types";

export const instant = false;

export const metadata = {
  title: "Analíticas",
};

export default async function AnaliticasPage({
  searchParams,
}: {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
    area_id?: string;
    categoria_id?: string;
    asignado_a_id?: string;
  }>;
}) {
  const { usuario } = await requerirSesion();

  if (usuario.rol !== "Administrador" && usuario.rol !== "Soporte") {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main id="contenido" className="container mx-auto px-4 py-8">
          <h1 className="mb-2 text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">
            Esta sección es solo para administradores y soporte.
          </p>
        </main>
      </div>
    );
  }

  const params = await searchParams;
  const esAdmin = usuario.rol === "Administrador";
  const desde = params.desde ?? "";
  const hasta = params.hasta ?? "";

  const filtros: Filtros = {};
  if (desde) filtros.desde = desde;
  if (hasta) filtros.hasta = hasta;
  if (params.area_id) filtros.area_id = params.area_id;
  if (params.categoria_id) filtros.categoria_id = params.categoria_id;
  if (esAdmin && params.asignado_a_id) filtros.asignado_a_id = params.asignado_a_id;

  const [data, areas, categorias, paginaSoportes] = await Promise.all([
    obtenerAnaliticasDashboard(filtros),
    obtenerAreasTodas(),
    obtenerCategoriasTodas(),
    esAdmin ? obtenerUsuarios({ rol: "Soporte", limite: 100 }) : Promise.resolve(null),
  ]);

  const soportes: Usuario[] = paginaSoportes?.data ?? [];

  const rango: { desde?: string; hasta?: string } = {};
  if (desde) rango.desde = desde;
  if (hasta) rango.hasta = hasta;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main id="contenido" className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Analíticas</h1>
            <p className="text-muted-foreground text-sm">
              Métricas generales sobre el desempeño del sistema de tickets y usuarios.
            </p>
          </div>

          <BotonExportarPdf data={data} rango={rango} />
        </header>

        <FiltrosAnaliticas
          desde={desde}
          hasta={hasta}
          areaId={params.area_id ?? ""}
          categoriaId={params.categoria_id ?? ""}
          asignadoId={params.asignado_a_id ?? ""}
          areas={areas}
          categorias={categorias}
          soportes={soportes}
          mostrarSoportes={esAdmin}
        />

        <TarjetasMetricas data={data} />
        <GraficasDashboard data={data} />
        <CargaSoportes soportes={data.soportes} />
      </main>
    </div>
  );
}
