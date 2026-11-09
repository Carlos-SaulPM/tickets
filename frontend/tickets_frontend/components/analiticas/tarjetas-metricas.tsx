import { Ticket, CheckCircle2, Clock, Users, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAnaliticasDTO } from "@/types/analiticas.types";

interface Props {
  data: DashboardAnaliticasDTO;
}

export function TarjetasMetricas({ data }: Props) {
  const metricasTickets = [
    {
      titulo: "Tickets Activos",
      valor: data.tickets.activos,
      descripcion: "Abiertos, en proceso o en revisión",
      icono: Clock,
      colorIcono: "text-amber-500",
      bgIcono: "bg-amber-500/10",
    },
    {
      titulo: "Tickets Resueltos",
      valor: data.tickets.resueltos,
      descripcion: "Solución propuesta al usuario",
      icono: CheckCircle2,
      colorIcono: "text-emerald-500",
      bgIcono: "bg-emerald-500/10",
    },
    {
      titulo: "Tickets Cerrados",
      valor: data.tickets.cerrados,
      descripcion: "Tickets finalizados",
      icono: Ticket,
      colorIcono: "text-blue-500",
      bgIcono: "bg-blue-500/10",
    },
  ];

  const metricasUsuarios = [
    {
      titulo: "Usuarios Registrados",
      valor: data.usuarios.registrados,
      descripcion: "Total de cuentas creadas",
      icono: Users,
      colorIcono: "text-indigo-500",
      bgIcono: "bg-indigo-500/10",
    },
    {
      titulo: "Usuarios Activos",
      valor: data.usuarios.activos,
      descripcion: "Cuentas operativas",
      icono: UserCheck,
      colorIcono: "text-green-500",
      bgIcono: "bg-green-500/10",
    },
    {
      titulo: "Usuarios Inactivos / Baja",
      valor: data.usuarios.inactivos,
      descripcion: "Cuentas suspendidas o dadas de baja",
      icono: UserX,
      colorIcono: "text-rose-500",
      bgIcono: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Resumen de Tickets</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricasTickets.map((item) => (
            <Card key={item.titulo}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.titulo}</CardTitle>
                <div className={`p-2 rounded-lg ${item.bgIcono}`}>
                  <item.icono className={`h-4 w-4 ${item.colorIcono}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.valor}</div>
                <p className="text-xs text-muted-foreground mt-1">{item.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Resumen de Usuarios</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricasUsuarios.map((item) => (
            <Card key={item.titulo}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.titulo}</CardTitle>
                <div className={`p-2 rounded-lg ${item.bgIcono}`}>
                  <item.icono className={`h-4 w-4 ${item.colorIcono}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.valor}</div>
                <p className="text-xs text-muted-foreground mt-1">{item.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}