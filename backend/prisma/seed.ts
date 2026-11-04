import "dotenv/config";

import { copyFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  EstadoTicket,
  EstadoUsuario,
  NombreRol,
  TipoEventoHistorial,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es requerida para ejecutar el seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR ?? "./uploads");
const ASSETS_DIR = join(process.cwd(), "prisma", "seed-assets");

const roles: Array<{ nombre: NombreRol; descripcion: string }> = [
  { nombre: NombreRol.Administrador, descripcion: "Control total del sistema" },
  { nombre: NombreRol.Soporte, descripcion: "Atención y seguimiento de tickets" },
  { nombre: NombreRol.Usuario, descripcion: "Usuario final que reporta tickets" },
];

const areas = ["Sistemas", "Soporte"];

const categorias = [
  { nombre: "Hardware", descripcion: "Equipos y periféricos" },
  { nombre: "Software", descripcion: "Aplicaciones y sistemas" },
  { nombre: "Acceso", descripcion: "Cuentas y permisos" },
];

const usuarios = [
  {
    nombre: "Admin",
    apellido_paterno: "Prueba",
    apellido_materno: "Sistema",
    correo_electronico: "admin@example.com",
    contrasena: "admin123",
    rol: NombreRol.Administrador,
  },
  {
    nombre: "Soporte",
    apellido_paterno: "Prueba",
    apellido_materno: "Sistema",
    correo_electronico: "soporte@example.com",
    contrasena: "soporte123",
    rol: NombreRol.Soporte,
  },
  {
    nombre: "Usuario",
    apellido_paterno: "Prueba",
    apellido_materno: "Sistema",
    correo_electronico: "usuario@example.com",
    contrasena: "usuario123",
    rol: NombreRol.Usuario,
  },
];

const DEMO_TICKET_ID = "d0000000-0000-4000-8000-000000000001";

interface AdjuntoDemo {
  id: string;
  mensajeId: string | null;
  archivo: string;
  nombre: string;
  alt: string;
  autorId: string;
  hace: number;
  incrustado: boolean;
}

/**
 * Ticket de demostración con imágenes incrustadas, un adjunto suelto y un huérfano
 * para probar `pnpm db:limpiar-adjuntos`. Es idempotente: refresca sus propias fechas.
 */
const sembrarDemostracion = async () => {
  const [usuario, soporte, categoria, area] = await Promise.all([
    prisma.usuario.findUnique({ where: { correo_electronico: "usuario@example.com" } }),
    prisma.usuario.findUnique({ where: { correo_electronico: "soporte@example.com" } }),
    prisma.categoria.findUnique({ where: { nombre: "Hardware" } }),
    prisma.area.findUnique({ where: { nombre: "Sistemas" } }),
  ]);

  if (!usuario || !soporte || !categoria || !area) {
    throw new Error(
      "El seed de demostración necesita los usuarios base, la categoría Hardware y el área Sistemas"
    );
  }

  const mensajeUno = "d0000000-0000-4000-8000-000000000011";
  const mensajeDos = "d0000000-0000-4000-8000-000000000012";
  const mensajeTres = "d0000000-0000-4000-8000-000000000013";

  const ahora = Date.now();
  const haceMinutos = (minutos: number) => new Date(ahora - minutos * 60 * 1000);

  const adjuntos: AdjuntoDemo[] = [
    {
      id: "d0000000-0000-4000-8000-000000000021",
      mensajeId: mensajeUno,
      archivo: "captura-error.png",
      nombre: "captura-error.png",
      alt: "Captura del mensaje de error al iniciar el sistema",
      autorId: usuario.id,
      hace: 150,
      incrustado: true,
    },
    {
      id: "d0000000-0000-4000-8000-000000000022",
      mensajeId: mensajeDos,
      archivo: "pantalla-antes.png",
      nombre: "pantalla-antes.png",
      alt: "Pantalla del sistema antes del ajuste",
      autorId: soporte.id,
      hace: 140,
      incrustado: true,
    },
    {
      id: "d0000000-0000-4000-8000-000000000023",
      mensajeId: mensajeDos,
      archivo: "pantalla-despues.png",
      nombre: "pantalla-despues.png",
      alt: "Pantalla del sistema después del ajuste",
      autorId: soporte.id,
      hace: 140,
      incrustado: true,
    },
    {
      id: "d0000000-0000-4000-8000-000000000024",
      mensajeId: mensajeTres,
      archivo: "archivo-suelto.png",
      nombre: "reporte-de-sesion.png",
      alt: "Reporte de sesión adjunto sin incrustar",
      autorId: soporte.id,
      hace: 130,
      incrustado: false,
    },
    {
      id: "d0000000-0000-4000-8000-000000000025",
      mensajeId: null,
      archivo: "huerfano.png",
      nombre: "huerfano.png",
      alt: "Adjunto subido sin mensaje",
      autorId: usuario.id,
      hace: 48 * 60,
      incrustado: false,
    },
  ];

  const texto = (mensajeId: string, contenido: string) => {
    const imagenes = adjuntos
      .filter(adjunto => adjunto.mensajeId === mensajeId && adjunto.incrustado)
      .map(adjunto => `<img src="/api/adjuntos/${adjunto.id}" alt="${adjunto.alt}" />`)
      .join("");

    return `<p>${contenido}</p>${imagenes}`;
  };

  const mensajes = [
    {
      id: mensajeUno,
      usuarioId: usuario.id,
      hace: 150,
      mensaje: texto(
        mensajeUno,
        "Buen día. Adjunto la captura del error que aparece al iniciar el sistema."
      ),
    },
    {
      id: mensajeDos,
      usuarioId: soporte.id,
      hace: 140,
      mensaje: texto(mensajeDos, "Comparé antes y después del ajuste. Las dos capturas:"),
    },
    {
      id: mensajeTres,
      usuarioId: soporte.id,
      hace: 130,
      mensaje: texto(
        mensajeTres,
        "También dejo el reporte de sesión, por si lo necesitas. No lo incrusté para no alargar el mensaje."
      ),
    },
  ];

  await prisma.ticket.upsert({
    where: { id: DEMO_TICKET_ID },
    update: {
      asunto: "Demostración de imágenes y adjuntos",
      descripcion:
        "Ticket creado por el seed para revisar el visor de imágenes, los adjuntos sueltos y la limpieza de huérfanos. Se puede editar o cerrar sin afectar al resto del sistema.",
      estado: EstadoTicket.En_proceso,
      categoria_id: categoria.id,
      area_id: area.id,
      asignado_a_id: soporte.id,
      creado_en: haceMinutos(160),
    },
    create: {
      id: DEMO_TICKET_ID,
      codigo: "#TK-DEMO",
      asunto: "Demostración de imágenes y adjuntos",
      descripcion:
        "Ticket creado por el seed para revisar el visor de imágenes, los adjuntos sueltos y la limpieza de huérfanos. Se puede editar o cerrar sin afectar al resto del sistema.",
      prioridad: "Media",
      estado: EstadoTicket.En_proceso,
      categoria_id: categoria.id,
      area_id: area.id,
      usuario_creador_id: usuario.id,
      asignado_a_id: soporte.id,
      creado_en: haceMinutos(160),
    },
  });

  for (const mensaje of mensajes) {
    await prisma.ticketMensaje.upsert({
      where: { id: mensaje.id },
      update: { mensaje: mensaje.mensaje, creado_en: haceMinutos(mensaje.hace) },
      create: {
        id: mensaje.id,
        ticket_id: DEMO_TICKET_ID,
        usuario_id: mensaje.usuarioId,
        mensaje: mensaje.mensaje,
        creado_en: haceMinutos(mensaje.hace),
      },
    });
  }

  for (const adjunto of adjuntos) {
    const almacenado = join("tickets", DEMO_TICKET_ID, `${adjunto.id}.png`);
    const destino = join(UPLOADS_DIR, almacenado);

    mkdirSync(join(UPLOADS_DIR, "tickets", DEMO_TICKET_ID), { recursive: true });
    copyFileSync(join(ASSETS_DIR, adjunto.archivo), destino);

    const datos = {
      ticket_id: DEMO_TICKET_ID,
      mensaje_id: adjunto.mensajeId,
      nombre_original: adjunto.nombre,
      nombre_almacenado: almacenado,
      tipo_mime: "image/png",
      ruta_url: `/api/v1/adjuntos/${adjunto.id}`,
      subido_por_id: adjunto.autorId,
      creado_en: haceMinutos(adjunto.hace),
    };

    await prisma.archivoAdjunto.upsert({
      where: { id: adjunto.id },
      update: datos,
      create: { id: adjunto.id, ...datos },
    });
  }

  await prisma.historialTicket.upsert({
    where: { id: "d0000000-0000-4000-8000-000000000031" },
    update: {},
    create: {
      id: "d0000000-0000-4000-8000-000000000031",
      ticket_id: DEMO_TICKET_ID,
      usuario_id: usuario.id,
      tipo_evento: TipoEventoHistorial.CREACION,
      estado_nuevo: EstadoTicket.Abierto,
      detalle: "Ticket de demostración",
      fecha_cambio: haceMinutos(160),
    },
  });

  console.log("Ticket de demostración #TK-DEMO listo.");
};

const main = async () => {
  const rolesPorNombre = new Map<NombreRol, string>();

  for (const rol of roles) {
    const guardado = await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: rol,
    });

    rolesPorNombre.set(guardado.nombre, guardado.id);
  }

  for (const nombre of areas) {
    await prisma.area.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: categoria.nombre },
      update: { descripcion: categoria.descripcion },
      create: categoria,
    });
  }

  for (const usuario of usuarios) {
    const rol_id = rolesPorNombre.get(usuario.rol);

    if (!rol_id) {
      throw new Error(`No se encontró el rol ${usuario.rol}`);
    }

    const contrasena = await argon2.hash(usuario.contrasena, {
      type: argon2.argon2id,
    });

    await prisma.usuario.upsert({
      where: { correo_electronico: usuario.correo_electronico },
      update: {
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        contrasena,
        rol_id,
        estado: EstadoUsuario.Activo,
      },
      create: {
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        correo_electronico: usuario.correo_electronico,
        contrasena,
        rol_id,
        estado: EstadoUsuario.Activo,
      },
    });
  }

  await sembrarDemostracion();

  console.log("Seed completado.");
};

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
