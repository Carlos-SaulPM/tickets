-- AlterEnum
ALTER TYPE "EstadoTicket" ADD VALUE 'En_revision';

-- AlterEnum
ALTER TYPE "TipoEventoHistorial" ADD VALUE 'PROPUESTA_SOLUCION';

-- AlterTable
ALTER TABLE "ticket_mensajes" ADD COLUMN     "es_propuesta_solucion" BOOLEAN NOT NULL DEFAULT false;
