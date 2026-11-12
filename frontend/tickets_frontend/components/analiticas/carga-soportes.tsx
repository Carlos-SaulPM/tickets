import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CargaSoporte } from "@/types/analiticas.types";

export function CargaSoportes({ soportes }: { soportes: CargaSoporte[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga por Soporte</CardTitle>
        <CardDescription>Tickets activos asignados a cada persona</CardDescription>
      </CardHeader>
      <CardContent>
        {soportes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay tickets activos asignados en el periodo.
          </p>
        ) : (
          <ul className="divide-y">
            {soportes.map(soporte => (
              <li
                key={soporte.id}
                className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
              >
                <span className="text-sm">
                  {soporte.nombre} {soporte.apellido_paterno}
                </span>
                <span className="text-sm font-medium tabular-nums">{soporte.activos}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
