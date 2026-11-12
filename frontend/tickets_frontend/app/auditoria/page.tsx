import Link from "next/link";

import { FiltrosAuditoria } from "@/components/auditoria/filtros-auditoria";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatearFecha } from "@/lib/fechas";
import { obtenerAuditoria } from "@/lib/server/auditoria";
import { requerirSesion } from "@/lib/server/sesion";
import type { AccionAuditoria, EntidadAuditoria } from "@/types/auditoria.types";

export const instant = false;

export const metadata = {
  title: "Auditoría",
};

const ACCIONES: Record<AccionAuditoria, string> = {
  CREAR: "Crear",
  EDITAR: "Editar",
  BAJA: "Baja",
  REACTIVAR: "Reactivar",
  RESTABLECER_CONTRASENA: "Restablecer contraseña",
  REABRIR: "Reabrir",
};

const ENTIDADES: Record<EntidadAuditoria, string> = {
  USUARIO: "Usuario",
  AREA: "Área",
  CATEGORIA: "Categoría",
  TICKET: "Ticket",
};

const ENTIDADES_VALIDAS: EntidadAuditoria[] = ["USUARIO", "AREA", "CATEGORIA", "TICKET"];

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; entidad?: string }>;
}) {
  const { usuario } = await requerirSesion();

  if (usuario.rol !== "Administrador") {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main id="contenido" className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="mb-2 text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
        </main>
      </div>
    );
  }

  const params = await searchParams;
  const pagina = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const entidad = ENTIDADES_VALIDAS.includes(params.entidad as EntidadAuditoria)
    ? (params.entidad as EntidadAuditoria)
    : undefined;

  const { data, meta } = await obtenerAuditoria({
    pagina,
    limite: 20,
    ...(entidad ? { entidad } : {}),
  });

  const totalPaginas = Math.max(1, meta.total_paginas);
  const consulta = (nuevaPagina: number) => {
    const busqueda = new URLSearchParams();
    if (entidad) busqueda.set("entidad", entidad);
    if (nuevaPagina > 1) busqueda.set("pagina", String(nuevaPagina));
    const texto = busqueda.toString();

    return `/auditoria${texto ? `?${texto}` : ""}`;
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main id="contenido" className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-muted-foreground text-sm">
            Registro de las acciones administrativas sobre usuarios, catálogos y tickets.
          </p>
        </header>

        <FiltrosAuditoria entidad={entidad} />

        {data.length === 0 ? (
          <div className="text-muted-foreground rounded-md border border-dashed px-6 py-12 text-center text-sm">
            No hay registros de auditoría.
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {data.map(registro => (
              <div key={registro.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{ACCIONES[registro.accion]}</Badge>
                  <span className="text-sm font-medium">{ENTIDADES[registro.entidad]}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatearFecha(registro.creado_en)}
                  </span>
                </div>
                <p className="text-sm">{registro.detalle ?? "Sin detalle"}</p>
                <p className="text-muted-foreground text-xs">
                  {registro.usuario.nombre} {registro.usuario.apellido_paterno}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            Página {meta.pagina} de {totalPaginas} · {meta.total} registros
          </span>
          <div className="flex gap-2">
            {meta.pagina > 1 && (
              <Button size="sm" variant="outline" asChild>
                <Link href={consulta(meta.pagina - 1)}>Anterior</Link>
              </Button>
            )}
            {meta.pagina < totalPaginas && (
              <Button size="sm" variant="outline" asChild>
                <Link href={consulta(meta.pagina + 1)}>Siguiente</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
