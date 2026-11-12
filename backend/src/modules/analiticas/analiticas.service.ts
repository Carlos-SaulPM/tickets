import { Prisma } from "@/generated/prisma/client";
import { NombreRol } from "@/generated/prisma/enums";
import type { UsuarioAutenticado } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";

import { AnaliticasRepository, type DashboardAnaliticasDTO } from "./analiticas.repository";
import type { DashboardQuery } from "./analiticas.schema";

export class AnaliticasService {
  constructor(private readonly repository: AnaliticasRepository = new AnaliticasRepository()) {}

  async obtenerDashboard(
    usuario: UsuarioAutenticado,
    filtros: DashboardQuery = {}
  ): Promise<DashboardAnaliticasDTO> {
    if (usuario.rol !== NombreRol.Administrador && usuario.rol !== NombreRol.Soporte) {
      throw new ApiError(403, "Solo el administrador y soporte pueden consultar las analiticas");
    }

    const condiciones: Prisma.TicketWhereInput[] = [];

    if (usuario.rol === NombreRol.Soporte) {
      condiciones.push({ asignado_a_id: usuario.id });
    } else if (filtros.asignado_a_id) {
      condiciones.push({ asignado_a_id: filtros.asignado_a_id });
    }

    if (filtros.area_id) condiciones.push({ area_id: filtros.area_id });
    if (filtros.categoria_id) condiciones.push({ categoria_id: filtros.categoria_id });
    if (filtros.desde) condiciones.push({ creado_en: { gte: filtros.desde } });

    if (filtros.hasta) {
      const hasta = new Date(filtros.hasta);
      hasta.setHours(23, 59, 59, 999);
      condiciones.push({ creado_en: { lte: hasta } });
    }

    const whereTickets: Prisma.TicketWhereInput =
      condiciones.length > 0 ? { AND: condiciones } : {};

    return await this.repository.obtenerDashboard(whereTickets);
  }
}
