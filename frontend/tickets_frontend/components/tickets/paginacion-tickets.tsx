import Link from "next/link";

import { Button } from "@/components/ui/button";
import { construirConsultaTickets } from "@/lib/consulta-tickets";
import type { ConsultaTickets, MetaTickets } from "@/types/ticket.types";

const hrefPagina = (filtros: ConsultaTickets, pagina: number) =>
  `/tickets?${construirConsultaTickets({ ...filtros, pagina })}`;

export function PaginacionTickets({
  meta,
  filtros,
}: {
  meta: MetaTickets;
  filtros: ConsultaTickets;
}) {
  if (meta.total_paginas <= 1) return null;

  const hayAnterior = meta.pagina > 1;
  const haySiguiente = meta.pagina < meta.total_paginas;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        Página {meta.pagina} de {meta.total_paginas} · {meta.total} tickets
      </p>

      <div className="flex gap-2">
        {hayAnterior ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefPagina(filtros, meta.pagina - 1)}>Anterior</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
        )}

        {haySiguiente ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefPagina(filtros, meta.pagina + 1)}>Siguiente</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
