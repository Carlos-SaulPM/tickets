import { NombreRol } from "@/generated/prisma/enums";
import type { UsuarioAutenticado } from "@/types/autenticacion.types";

interface TicketVisible {
  usuario_creador: { id: string };
  asignado_a: { id: string } | null;
}

export const puedeVerTicket = (ticket: TicketVisible, usuario: UsuarioAutenticado) => {
  if (usuario.rol === NombreRol.Administrador) return true;

  if (usuario.rol === NombreRol.Soporte) {
    return ticket.asignado_a === null || ticket.asignado_a.id === usuario.id;
  }

  return ticket.usuario_creador.id === usuario.id;
};
