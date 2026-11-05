import type {
  EstadoTicket,
  NombreRol,
  PrioridadTicket,
  TipoEventoHistorial,
} from "@/generated/prisma/enums";

export interface TicketUsuarioResumen {
  id: string;
  nombre: string;
  apellido_paterno: string;
  correo_electronico: string;
}

export interface TicketUsuarioDetalle extends TicketUsuarioResumen {
  rol: { nombre: NombreRol };
}

export interface TicketCategoriaResumen {
  id: string;
  nombre: string;
}

export interface TicketAreaResumen {
  id: string;
  nombre: string;
}

export interface Ticket {
  id: string;
  codigo: string;
  asunto: string;
  descripcion: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  categoria: TicketCategoriaResumen;
  area: TicketAreaResumen | null;
  usuario_creador: TicketUsuarioResumen;
  asignado_a: TicketUsuarioResumen | null;
  creado_en: Date;
  actualizado_en: Date;
  fecha_cierre: Date | null;
}

export interface Adjunto {
  id: string;
  nombre_original: string;
  tipo_mime: string | null;
  ruta_url: string;
}

export interface TicketMensaje {
  id: string;
  ticket_id: string;
  mensaje: string;
  es_nota_interna: boolean;
  es_propuesta_solucion: boolean;
  creado_en: Date;
  usuario: TicketUsuarioResumen;
  adjuntos: Adjunto[];
}

export interface CrearTicketRepositoryDTO {
  codigo: string;
  asunto: string;
  descripcion: string;
  prioridad: PrioridadTicket;
  categoria_id: string;
  area_id: string | null;
  usuario_creador_id: string;
}

export interface ActualizarTicketRepositoryDTO {
  asunto?: string | undefined;
  descripcion?: string | undefined;
  prioridad?: PrioridadTicket | undefined;
  categoria_id?: string | undefined;
  area_id?: string | null | undefined;
}

export interface CrearMensajeRepositoryDTO {
  ticket_id: string;
  usuario_id: string;
  mensaje: string;
  es_nota_interna: boolean;
  es_propuesta_solucion: boolean;
}

export interface CrearAdjuntoRepositoryDTO {
  id: string;
  ticket_id: string;
  nombre_original: string;
  nombre_almacenado: string;
  tipo_mime: string;
  ruta_url: string;
  subido_por_id: string;
}

export interface CrearHistorialRepositoryDTO {
  ticket_id: string;
  usuario_id: string;
  tipo_evento: TipoEventoHistorial;
  estado_anterior: EstadoTicket | null;
  estado_nuevo: EstadoTicket | null;
  detalle: string | null;
}

export interface CrearNotificacionRepositoryDTO {
  usuario_id: string;
  ticket_id: string | null;
  mensaje: string;
}

export interface HistorialTicket {
  id: string;
  tipo_evento: TipoEventoHistorial;
  estado_anterior: EstadoTicket | null;
  estado_nuevo: EstadoTicket | null;
  detalle: string | null;
  fecha_cambio: Date;
  usuario: TicketUsuarioResumen;
}

export interface Notificacion {
  id: string;
  ticket_id: string | null;
  mensaje: string;
  leida: boolean;
  creado_en: Date;
  ticket: {
    id: string;
    codigo: string;
    asunto: string;
    estado: EstadoTicket;
  } | null;
}

export interface AdjuntoConTicket extends Adjunto {
  nombre_almacenado: string;
  ticket: {
    id: string;
    usuario_creador_id: string;
    asignado_a_id: string | null;
  };
}
