import { NombreRol } from "@/generated/prisma/enums";


import type { UsuarioAutenticado } from "@/types/autenticacion.types";
import { ApiError } from "@/utils/api-error";
import { Prisma } from "@/generated/prisma/client";

import { AnaliticasRepository, type DashboardAnaliticasDTO } from "./analiticas.repository";

export class AnaliticasService {
  constructor(private readonly repository: AnaliticasRepository = new AnaliticasRepository()) {}

  async obtenerDashboard(usuario: UsuarioAutenticado): Promise<DashboardAnaliticasDTO> {


    if (usuario.rol !== NombreRol.Administrador && usuario.rol !== NombreRol.Soporte) {
      throw new ApiError(403, "Solo el administrador y soporte pueden consultar las analiticas")
    }
    const whereTickets: Prisma.TicketWhereInput =
          usuario.rol === NombreRol.Administrador ? {} : { asignado_a_id: usuario.id };

    return await this.repository.obtenerDashboard(whereTickets);
  }
}
