import { prisma } from "@/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { EstadoTicket, EstadoUsuario } from "@/generated/prisma/enums";

export interface DashboardAnaliticasDTO {
  tickets: {
    activos: number;
    cerrados: number;
    resueltos: number;
    total: number;
  };
  usuarios: {
    registrados: number;
    activos: number;
    inactivos: number;
  };
}

export class AnaliticasRepository {
  async obtenerDashboard(
    whereTickets: Prisma.TicketWhereInput = {}
  ): Promise<DashboardAnaliticasDTO> {
    const [conteoTickets, conteoUsuarios, totalUsuarios] = await Promise.all([
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
    ]);

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
        resueltos: mapaTickets.get(EstadoTicket.Resuelto) ?? 0,
        total: Array.from(mapaTickets.values()).reduce((acc, curr) => acc + curr, 0),
      },
      usuarios: {
        registrados: totalUsuarios,
        activos: mapaUsuarios.get(EstadoUsuario.Activo) ?? 0,
        inactivos:
          (mapaUsuarios.get(EstadoUsuario.Inactivo) ?? 0) +
          (mapaUsuarios.get(EstadoUsuario.Baja) ?? 0),
      },
    };
  }
}
