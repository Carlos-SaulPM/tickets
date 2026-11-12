import { CheckCircle2, Clock, Ticket, Timer, UserCheck, Users, UserX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAnaliticasDTO } from "@/types/analiticas.types";

interface Props {
  data: DashboardAnaliticasDTO;
}

export function TarjetasMetricas({ data }: Props) {
  const metricasTickets = [
    {
      titulo: "Tickets activos",
      valor: data.tickets.activos,
      descripcion: "Abiertos, en proceso o en revisión",
      icono: Clock,
    },
    {
      titulo: "Propuestas en revisión",
      valor: data.tickets.resueltos,
      descripcion: "Esperando aprobación del creador",
      icono: CheckCircle2,
    },
    {
      titulo: "Tickets cerrados",
      valor: data.tickets.cerrados,
      descripcion: "Tickets finalizados",
      icono: Ticket,
    },
    {
      titulo: "Tiempo promedio de cierre",
      valor:
        data.tickets.tiempo_promedio_cierre_horas === null
          ? "Sin datos"
          : `${data.tickets.tiempo_promedio_cierre_horas} h`,
      descripcion: "Tickets cerrados del periodo",
      icono: Timer,
    },
  ];

  const metricasUsuarios = [
    {
      titulo: "Usuarios registrados",
      valor: data.usuarios.registrados,
      descripcion: "Total de cuentas creadas",
      icono: Users,
    },
    {
      titulo: "Usuarios activos",
      valor: data.usuarios.activos,
      descripcion: "Cuentas operativas",
      icono: UserCheck,
    },
    {
      titulo: "Usuarios inactivos o de baja",
      valor: data.usuarios.inactivos,
      descripcion: "Cuentas suspendidas o dadas de baja",
      icono: UserX,
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Resumen de tickets</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricasTickets.map(item => (
            <Card key={item.titulo}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.titulo}</CardTitle>
                <div className="bg-muted text-muted-foreground rounded-lg p-2">
                  <item.icono className="size-4" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{item.valor}</div>
                <p className="text-muted-foreground mt-1 text-xs">{item.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Resumen de usuarios</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricasUsuarios.map(item => (
            <Card key={item.titulo}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.titulo}</CardTitle>
                <div className="bg-muted text-muted-foreground rounded-lg p-2">
                  <item.icono className="size-4" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{item.valor}</div>
                <p className="text-muted-foreground mt-1 text-xs">{item.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
