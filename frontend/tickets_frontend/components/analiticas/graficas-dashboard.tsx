"use client";

import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DashboardAnaliticasDTO } from "@/types/analiticas.types";

interface Props {
  data: DashboardAnaliticasDTO;
}

const configGraficaTickets = {
  activos: { label: "Activos", color: "hsl(var(--chart-1, 38 92% 50%))" },
  resueltos: { label: "Resueltos", color: "hsl(var(--chart-2, 160 84% 39%))" },
  cerrados: { label: "Cerrados", color: "hsl(var(--chart-3, 217 91% 60%))" },
};

const configGraficaUsuarios = {
  activos: { label: "Activos", color: "hsl(var(--chart-1, 142 76% 36%))" },
  inactivos: { label: "Inactivos/Baja", color: "hsl(var(--chart-2, 346 87% 43%))" },
};

export function GraficasDashboard({ data }: Props) {
  const dataTickets = [
    { estado: "Activos", cantidad: data.tickets.activos, fill: "#f59e0b" },
    { estado: "Resueltos", cantidad: data.tickets.resueltos, fill: "#10b981" },
    { estado: "Cerrados", cantidad: data.tickets.cerrados, fill: "#3b82f6" },
  ];

  const dataUsuarios = [
    { name: "Activos", value: data.usuarios.activos, fill: "#22c55e" },
    { name: "Inactivos", value: data.usuarios.inactivos, fill: "#ef4444" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Tickets</CardTitle>
          <CardDescription>Cantidad de tickets desglosada por su estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={configGraficaTickets} className="h-72 w-full">
            <BarChart data={dataTickets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="estado" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                {dataTickets.map((entry, index) => (
                  <Cell key={`cell-ticket-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Usuarios</CardTitle>

          <CardDescription>Proporción entre cuentas activas e inactivas/baja</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          <ChartContainer config={configGraficaUsuarios} className="h-72 w-full">
            <PieChart>
              <Pie
                data={dataUsuarios}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {dataUsuarios.map((entry, index) => (
                  <Cell key={`cell-user-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}