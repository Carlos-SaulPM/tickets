"use client";

import { Bar, BarChart, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DashboardAnaliticasDTO } from "@/types/analiticas.types";

interface Props {
  data: DashboardAnaliticasDTO;
}

const configGraficaTickets = {
  cantidad: { label: "Tickets", color: "var(--chart-1)" },
};

const configGraficaUsuarios = {
  activos: { label: "Activos", color: "var(--chart-1)" },
  inactivos: { label: "Inactivos o de baja", color: "var(--chart-2)" },
};

export function GraficasDashboard({ data }: Props) {
  const dataTickets = [
    { estado: "Activos", cantidad: data.tickets.activos, fill: "var(--chart-1)" },
    { estado: "Propuestas", cantidad: data.tickets.resueltos, fill: "var(--chart-3)" },
    { estado: "Cerrados", cantidad: data.tickets.cerrados, fill: "var(--chart-5)" },
  ];

  const dataUsuarios = [
    { name: "Activos", value: data.usuarios.activos, fill: "var(--chart-1)" },
    { name: "Inactivos o de baja", value: data.usuarios.inactivos, fill: "var(--chart-2)" },
  ];

  const totalUsuarios = data.usuarios.activos + data.usuarios.inactivos;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribución de tickets</CardTitle>
          <CardDescription>Cantidad de tickets por su estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="img"
            aria-label="Gráfica de barras con los tickets por estado: activos, propuestas y cerrados."
          >
            <ChartContainer config={configGraficaTickets} className="h-72 w-full">
              <BarChart data={dataTickets} margin={{ top: 24, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="estado" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent nameKey="cantidad" />} />
                <Bar dataKey="cantidad" name="Tickets" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="cantidad"
                    position="top"
                    fill="var(--foreground)"
                    fontSize={12}
                  />
                  {dataTickets.map((entry, index) => (
                    <Cell key={`cell-ticket-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de usuarios</CardTitle>
          <CardDescription>Proporción entre cuentas activas e inactivas o de baja</CardDescription>
        </CardHeader>
        <CardContent>
          {totalUsuarios === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Aún no hay usuarios registrados.
            </p>
          ) : (
            <div className="space-y-2">
              <div
                role="img"
                aria-label={`Gráfica circular: ${data.usuarios.activos} usuarios activos y ${data.usuarios.inactivos} inactivos o de baja.`}
              >
                <ChartContainer config={configGraficaUsuarios} className="h-64 w-full">
                  <PieChart>
                    <Pie
                      data={dataUsuarios}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {dataUsuarios.map((entry, index) => (
                        <Cell key={`cell-user-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--foreground)"
                      fontSize={24}
                      fontWeight={600}
                    >
                      {totalUsuarios}
                    </text>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              </div>

              <ul className="flex flex-wrap justify-center gap-4 text-xs">
                {dataUsuarios.map(item => (
                  <li key={item.name} className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: item.fill }}
                      aria-hidden
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium tabular-nums">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
