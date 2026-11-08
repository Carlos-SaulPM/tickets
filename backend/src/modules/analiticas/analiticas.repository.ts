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
  async obtenerDashboard(whereTickets: Prisma.TicketWhereInput = {}): Promise<DashboardAnaliticasDTO> {
    // Ejecutamos las consultas de agrupación de forma paralela en la BD
    
    const [conteoTickets, conteoUsuarios, totalUsuarios] = await prisma.$transaction([
      // Agrupar tickets por estado
      prisma.ticket.groupBy({
        by: ["estado"],
        where: whereTickets,
        _count: { _all: true },
      }),
      // Agrupar usuarios por estado
      prisma.usuario.groupBy({
        by: ["estado"],
        _count: { _all: true },
      }),
      // Cantidad total de usuarios registrados
      prisma.usuario.count(),
    ]);

    // Mapeo de tickets
    const mapaTickets = new Map(conteoTickets.map(item => [item.estado, item._count._all]));

    // Consideramos "Activos" los tickets en flujo (Abierto, En_proceso, En_revision)
    const ticketsActivos =
      (mapaTickets.get(EstadoTicket.Abierto) ?? 0) +
      (mapaTickets.get(EstadoTicket.En_proceso) ?? 0) +
      (mapaTickets.get(EstadoTicket.En_revision) ?? 0);

    const ticketsCerrados = mapaTickets.get(EstadoTicket.Cerrado) ?? 0;
    const ticketsResueltos = mapaTickets.get(EstadoTicket.Resuelto) ?? 0;
    const totalTickets = Array.from(mapaTickets.values()).reduce((acc, curr) => acc + curr, 0);

    // Mapeo de usuarios
    const mapaUsuarios = new Map(conteoUsuarios.map(item => [item.estado, item._count._all]));
    const usuariosActivos = mapaUsuarios.get(EstadoUsuario.Activo) ?? 0;
    const usuariosInactivos =
      (mapaUsuarios.get(EstadoUsuario.Inactivo) ?? 0) + (mapaUsuarios.get(EstadoUsuario.Baja) ?? 0);

    return {
      tickets: {
        activos: ticketsActivos,
        cerrados: ticketsCerrados,
        resueltos: ticketsResueltos,
        total: totalTickets,
      },
      usuarios: {
        registrados: totalUsuarios,
        activos: usuariosActivos,
        inactivos: usuariosInactivos,
      },
    };
  }
}
