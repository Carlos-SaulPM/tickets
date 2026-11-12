import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { EstadoTicket, EstadoUsuario } from "@/generated/prisma/enums";

export interface DashboardAnaliticasDTO {
  tickets: {
    activos: number;
    cerrados: number;
    resueltos: number;
    total: number;
    tiempo_promedio_cierre_horas: number | null;
  };
  usuarios: {
    registrados: number;
    activos: number;
    inactivos: number;
  };
  soportes: Array<{
    id: string;
    nombre: string;
    apellido_paterno: string;
    activos: number;
  }>;
}

export class AnaliticasRepository {
  async obtenerDashboard(
    whereTickets: Prisma.TicketWhereInput = {}
  ): Promise<DashboardAnaliticasDTO> {
    const whereCerrados: Prisma.TicketWhereInput = {
      AND: [whereTickets, { estado: EstadoTicket.Cerrado, fecha_cierre: { not: null } }],
    };

    const [conteoTickets, conteoUsuarios, totalUsuarios, cerradosConFecha, cargaSoportes] =
      await Promise.all([
        prisma.ticket.groupBy({
          by: ["estado"],
          where: whereTickets,
          _count: { _all: true },
        }),
        prisma.usuario.groupBy({
          by: ["estado"],
          _count: { _all: true },
        }),
        prisma.usuario.count(),
        prisma.ticket.findMany({
          where: whereCerrados,
          select: { creado_en: true, fecha_cierre: true },
        }),
        prisma.ticket.groupBy({
          by: ["asignado_a_id"],
          where: {
            AND: [
              whereTickets,
              {
                asignado_a_id: { not: null },
                estado: {
                  in: [EstadoTicket.Abierto, EstadoTicket.En_proceso, EstadoTicket.En_revision],
                },
              },
            ],
          },
          _count: { _all: true },
        }),
      ]);

    const idsSoportes = cargaSoportes
      .map(item => item.asignado_a_id)
      .filter((id): id is string => id !== null);

    const usuariosSoporte = await prisma.usuario.findMany({
      where: { id: { in: idsSoportes } },
      select: { id: true, nombre: true, apellido_paterno: true },
    });

    const mapaSoportes = new Map(usuariosSoporte.map(usuario => [usuario.id, usuario]));

    const soportes = cargaSoportes
      .map(item => {
        const usuario = item.asignado_a_id ? mapaSoportes.get(item.asignado_a_id) : undefined;

        return usuario
          ? {
              id: usuario.id,
              nombre: usuario.nombre,
              apellido_paterno: usuario.apellido_paterno,
              activos: item._count._all,
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.activos - a.activos);

    const milisegundos = cerradosConFecha.reduce((total, ticket) => {
      if (!ticket.fecha_cierre) return total;

      return total + (ticket.fecha_cierre.getTime() - ticket.creado_en.getTime());
    }, 0);

    const promedio =
      cerradosConFecha.length > 0
        ? Math.round((milisegundos / cerradosConFecha.length / 3600000) * 10) / 10
        : null;

    const mapaTickets = new Map(conteoTickets.map(item => [item.estado, item._count._all]));

    const ticketsActivos =
      (mapaTickets.get(EstadoTicket.Abierto) ?? 0) +
      (mapaTickets.get(EstadoTicket.En_proceso) ?? 0) +
      (mapaTickets.get(EstadoTicket.En_revision) ?? 0);

    const mapaUsuarios = new Map(conteoUsuarios.map(item => [item.estado, item._count._all]));

    return {
      tickets: {
        activos: ticketsActivos,
        cerrados: mapaTickets.get(EstadoTicket.Cerrado) ?? 0,
        resueltos: mapaTickets.get(EstadoTicket.En_revision) ?? 0,
        total: Array.from(mapaTickets.values()).reduce((acc, curr) => acc + curr, 0),
        tiempo_promedio_cierre_horas: promedio,
      },
      usuarios: {
        registrados: totalUsuarios,
        activos: mapaUsuarios.get(EstadoUsuario.Activo) ?? 0,
        inactivos:
          (mapaUsuarios.get(EstadoUsuario.Inactivo) ?? 0) +
          (mapaUsuarios.get(EstadoUsuario.Baja) ?? 0),
      },
      soportes,
    };
  }
}
