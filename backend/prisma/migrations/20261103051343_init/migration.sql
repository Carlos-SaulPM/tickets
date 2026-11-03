-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('Activo', 'Inactivo', 'Baja');

-- CreateEnum
CREATE TYPE "PrioridadTicket" AS ENUM ('Baja', 'Media', 'Alta', 'Critica');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('Abierto', 'En_proceso', 'Resuelto', 'Cerrado');

-- CreateEnum
CREATE TYPE "NombreRol" AS ENUM ('Administrador', 'Soporte', 'Usuario');

-- CreateEnum
CREATE TYPE "TipoEventoHistorial" AS ENUM ('CREACION', 'CAMBIO_ESTADO', 'REASIGNACION', 'CAMBIO_PRIORIDAD');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "nombre" "NombreRol" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellido_paterno" VARCHAR(50) NOT NULL,
    "apellido_materno" VARCHAR(50) NOT NULL,
    "correo_electronico" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "rol_id" UUID NOT NULL,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'Activo',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "asunto" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "prioridad" "PrioridadTicket" NOT NULL DEFAULT 'Media',
    "estado" "EstadoTicket" NOT NULL DEFAULT 'Abierto',
    "categoria_id" UUID NOT NULL,
    "area_id" UUID,
    "usuario_creador_id" UUID NOT NULL,
    "asignado_a_id" UUID,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMPTZ(6),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_mensajes" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "mensaje" TEXT NOT NULL,
    "es_nota_interna" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_adjuntos" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "mensaje_id" UUID,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_almacenado" VARCHAR(255) NOT NULL,
    "tipo_mime" VARCHAR(100),
    "ruta_url" VARCHAR(500) NOT NULL,
    "subido_por_id" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_tickets" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo_evento" "TipoEventoHistorial" NOT NULL,
    "estado_anterior" "EstadoTicket",
    "estado_nuevo" "EstadoTicket",
    "detalle" TEXT,
    "fecha_cambio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "ticket_id" UUID,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "areas_nombre_key" ON "areas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_codigo_key" ON "tickets"("codigo");

-- CreateIndex
CREATE INDEX "tickets_categoria_id_idx" ON "tickets"("categoria_id");

-- CreateIndex
CREATE INDEX "tickets_area_id_idx" ON "tickets"("area_id");

-- CreateIndex
CREATE INDEX "tickets_usuario_creador_id_idx" ON "tickets"("usuario_creador_id");

-- CreateIndex
CREATE INDEX "tickets_asignado_a_id_idx" ON "tickets"("asignado_a_id");

-- CreateIndex
CREATE INDEX "tickets_estado_idx" ON "tickets"("estado");

-- CreateIndex
CREATE INDEX "tickets_prioridad_idx" ON "tickets"("prioridad");

-- CreateIndex
CREATE INDEX "ticket_mensajes_ticket_id_idx" ON "ticket_mensajes"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_mensajes_usuario_id_idx" ON "ticket_mensajes"("usuario_id");

-- CreateIndex
CREATE INDEX "archivos_adjuntos_ticket_id_idx" ON "archivos_adjuntos"("ticket_id");

-- CreateIndex
CREATE INDEX "archivos_adjuntos_mensaje_id_idx" ON "archivos_adjuntos"("mensaje_id");

-- CreateIndex
CREATE INDEX "archivos_adjuntos_subido_por_id_idx" ON "archivos_adjuntos"("subido_por_id");

-- CreateIndex
CREATE INDEX "historial_tickets_ticket_id_idx" ON "historial_tickets"("ticket_id");

-- CreateIndex
CREATE INDEX "historial_tickets_usuario_id_idx" ON "historial_tickets"("usuario_id");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_id_idx" ON "notificaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "notificaciones_ticket_id_idx" ON "notificaciones"("ticket_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_usuario_creador_id_fkey" FOREIGN KEY ("usuario_creador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_asignado_a_id_fkey" FOREIGN KEY ("asignado_a_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_mensajes" ADD CONSTRAINT "ticket_mensajes_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_mensajes" ADD CONSTRAINT "ticket_mensajes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_adjuntos" ADD CONSTRAINT "archivos_adjuntos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_adjuntos" ADD CONSTRAINT "archivos_adjuntos_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "ticket_mensajes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_adjuntos" ADD CONSTRAINT "archivos_adjuntos_subido_por_id_fkey" FOREIGN KEY ("subido_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_tickets" ADD CONSTRAINT "historial_tickets_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_tickets" ADD CONSTRAINT "historial_tickets_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
