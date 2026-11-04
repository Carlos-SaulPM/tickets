import "dotenv/config";

import { randomUUID } from "node:crypto";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  EstadoTicket,
  EstadoUsuario,
  NombreRol,
  PrioridadTicket,
  TipoEventoHistorial,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es requerida para cargar los datos de demostración");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR ?? "./uploads");
const ASSETS_DIR = join(process.cwd(), "prisma", "seed-assets");

const PREFIJO_CODIGO = "#D-";
const DOMINIO_DEMO = "@demo.local";
const CONTRASENA_DEMO = "demo123";
const TICKETS_POR_DEFECTO = 60;

const repetir = <T>(valor: T, veces: number): T[] => Array.from({ length: veces }, () => valor);

const tomar = <T>(lista: readonly T[], indice: number): T => {
  const valor = lista[indice % lista.length];

  if (valor === undefined) {
    throw new Error("La lista no puede estar vacía");
  }

  return valor;
};

// ---------------------------------------------------------------------------
// Catálogo de usuarios de prueba
// ---------------------------------------------------------------------------

interface UsuarioDemo {
  correo: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rol: NombreRol;
}

const usuariosDemo: UsuarioDemo[] = [
  {
    correo: "soporte2@demo.local",
    nombre: "Laura",
    apellido_paterno: "Méndez",
    apellido_materno: "Ruiz",
    rol: NombreRol.Soporte,
  },
  {
    correo: "soporte3@demo.local",
    nombre: "Iván",
    apellido_paterno: "Ramírez",
    apellido_materno: "Soto",
    rol: NombreRol.Soporte,
  },
  {
    correo: "soporte4@demo.local",
    nombre: "Nadia",
    apellido_paterno: "Cortés",
    apellido_materno: "Bravo",
    rol: NombreRol.Soporte,
  },
  {
    correo: "soporte5@demo.local",
    nombre: "Emilio",
    apellido_paterno: "Fuentes",
    apellido_materno: "Lara",
    rol: NombreRol.Soporte,
  },
  {
    correo: "usuario2@demo.local",
    nombre: "Mariana",
    apellido_paterno: "Ortiz",
    apellido_materno: "Peña",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario3@demo.local",
    nombre: "Diego",
    apellido_paterno: "Salas",
    apellido_materno: "Núñez",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario4@demo.local",
    nombre: "Paola",
    apellido_paterno: "Vega",
    apellido_materno: "Herrera",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario5@demo.local",
    nombre: "Andrés",
    apellido_paterno: "Lima",
    apellido_materno: "Castro",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario6@demo.local",
    nombre: "Sofía",
    apellido_paterno: "Ríos",
    apellido_materno: "Delgado",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario7@demo.local",
    nombre: "Héctor",
    apellido_paterno: "Cano",
    apellido_materno: "Mejía",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario8@demo.local",
    nombre: "Lucía",
    apellido_paterno: "Paredes",
    apellido_materno: "Rangel",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario9@demo.local",
    nombre: "Raúl",
    apellido_paterno: "Ibarra",
    apellido_materno: "Solís",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario10@demo.local",
    nombre: "Elena",
    apellido_paterno: "Mora",
    apellido_materno: "Quintero",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario11@demo.local",
    nombre: "Tomás",
    apellido_paterno: "Aguilar",
    apellido_materno: "Pineda",
    rol: NombreRol.Usuario,
  },
  {
    correo: "usuario12@demo.local",
    nombre: "Renata",
    apellido_paterno: "Solís",
    apellido_materno: "Márquez",
    rol: NombreRol.Usuario,
  },
];

// ---------------------------------------------------------------------------
// Contenido de los tickets
// ---------------------------------------------------------------------------

interface MensajeDemo {
  autor: "creador" | "soporte" | "admin";
  texto: string;
  notaInterna?: boolean;
  propuesta?: boolean;
  imagenes?: string[];
  suelto?: string;
}

interface TicketDemo {
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  categoria: number;
  area: number | null;
  creador: number;
  asignado: number | null;
  diasAtras: number;
  mensajes: MensajeDemo[];
}

const IMAGEN_ERROR = "captura-error.png";
const IMAGEN_ANTES = "pantalla-antes.png";
const IMAGEN_DESPUES = "pantalla-despues.png";
const IMAGEN_SUELTA = "archivo-suelto.png";

const escenarios: TicketDemo[] = [
  {
    asunto: "La VPN no conecta desde la sucursal Norte",
    descripcion:
      "Desde ayer por la tarde nadie en la sucursal Norte puede conectarse a la VPN. El cliente marca error de tiempo de espera agotado. Ya reiniciamos el módem y probamos con dos equipos distintos.",
    estado: EstadoTicket.Abierto,
    prioridad: PrioridadTicket.Critica,
    categoria: 2,
    area: 0,
    creador: 1,
    asignado: null,
    diasAtras: 0,
    mensajes: [],
  },
  {
    asunto: "Solicitud de acceso al sistema de facturación",
    descripcion:
      "Me incorporé al área de administración esta semana y necesito acceso al sistema de facturación para revisar los comprobantes del mes.",
    estado: EstadoTicket.Abierto,
    prioridad: PrioridadTicket.Alta,
    categoria: 2,
    area: 1,
    creador: 3,
    asignado: 0,
    diasAtras: 1,
    mensajes: [
      {
        autor: "soporte",
        texto:
          "Recibido. Estoy validando con el área de administración que el perfil solicitado sea el correcto.",
        notaInterna: true,
      },
    ],
  },
  {
    asunto: "La impresora del piso 2 imprime borroso",
    descripcion:
      "Las hojas salen con franjas grises en la parte superior. Ya cambiamos el tóner y el problema continúa, así que sospechamos del tambor.",
    estado: EstadoTicket.En_proceso,
    prioridad: PrioridadTicket.Media,
    categoria: 0,
    area: 0,
    creador: 2,
    asignado: 1,
    diasAtras: 2,
    mensajes: [
      {
        autor: "soporte",
        texto:
          "Gracias por el detalle. Descarta el tóner entonces. Voy a revisar el tambor y el rodillo de arrastre; si hace falta lo reemplazamos mañana temprano.",
        notaInterna: true,
      },
      {
        autor: "soporte",
        texto:
          "Ya revisé la impresora de forma remota y el contador del tambor marca el final de su vida útil. Pedí el reemplazo a almacén.",
      },
      { autor: "creador", texto: "Perfecto, quedo pendiente. Mientras tanto uso la del piso 1." },
    ],
  },
  {
    asunto: "El sistema se cierra solo al abrir el módulo de reportes",
    descripcion:
      "Al entrar a Reportes la aplicación se cierra sin mostrar error. Pasa desde la actualización del lunes y solo en mi equipo. Adjunto las capturas del error y de la pantalla antes y después de aplicar el ajuste que me comentaron.",
    estado: EstadoTicket.En_proceso,
    prioridad: PrioridadTicket.Alta,
    categoria: 1,
    area: 0,
    creador: 4,
    asignado: 2,
    diasAtras: 3,
    mensajes: [
      {
        autor: "creador",
        texto: "Esta es la captura del error que aparece justo antes de cerrarse.",
        imagenes: [IMAGEN_ERROR],
      },
      {
        autor: "soporte",
        texto:
          "Comparé antes y después de reemplazar la librería de reportes. Con el cambio el módulo ya abre sin cerrarse.",
        imagenes: [IMAGEN_ANTES, IMAGEN_DESPUES],
      },
    ],
  },
  {
    asunto: "Los correos del área comercial llegan a la bandeja de no deseados",
    descripcion:
      "Los mensajes que envía el equipo comercial caen en spam en los buzones de los clientes. Necesitamos revisar los registros SPF y DKIM del dominio.",
    estado: EstadoTicket.En_revision,
    prioridad: PrioridadTicket.Alta,
    categoria: 1,
    area: 0,
    creador: 5,
    asignado: 3,
    diasAtras: 4,
    mensajes: [
      {
        autor: "soporte",
        texto:
          "Encontré que el registro SPF no incluye el servidor de campañas. Propongo actualizarlo y esperar la propagación antes de volver a enviar.",
        propuesta: true,
      },
    ],
  },
  {
    asunto: "Se perdió el acceso compartido de la carpeta de proyectos",
    descripcion:
      "El equipo de proyectos ya no puede entrar a la carpeta compartida. Windows pide credenciales y no las reconoce. Dejo además el reporte de sesión que me pidieron.",
    estado: EstadoTicket.En_revision,
    prioridad: PrioridadTicket.Media,
    categoria: 2,
    area: 1,
    creador: 6,
    asignado: 4,
    diasAtras: 5,
    mensajes: [
      {
        autor: "soporte",
        texto:
          "El grupo de seguridad del recurso se había quedado vacío tras el último cambio de directorio. Propongo restaurarlo y volver a publicar el recurso.",
        propuesta: true,
        suelto: IMAGEN_SUELTA,
      },
    ],
  },
  {
    asunto: "Equipo de recepción con reinicios aleatorios",
    descripcion:
      "La computadora de recepción se reinicia sola dos o tres veces al día. Ya se revisó la instalación eléctrica y el problema persiste.",
    estado: EstadoTicket.Resuelto,
    prioridad: PrioridadTicket.Media,
    categoria: 0,
    area: 0,
    creador: 7,
    asignado: 0,
    diasAtras: 8,
    mensajes: [
      { autor: "soporte", texto: "Voy a revisar los registros de eventos del equipo esta tarde." },
      {
        autor: "soporte",
        texto:
          "El origen era la fuente de poder. Se reemplazó y el equipo lleva tres días encendido sin reinicios.",
      },
      { autor: "creador", texto: "Confirmado, ya no se ha reiniciado. Muchas gracias." },
    ],
  },
  {
    asunto: "Alta de usuario para el nuevo integrante de almacén",
    descripcion:
      "Ingresa un compañero nuevo el lunes y necesitamos su cuenta de correo y acceso al sistema de inventarios.",
    estado: EstadoTicket.Cerrado,
    prioridad: PrioridadTicket.Baja,
    categoria: 2,
    area: 1,
    creador: 8,
    asignado: 1,
    diasAtras: 12,
    mensajes: [
      { autor: "soporte", texto: "Cuenta creada. La contraseña temporal se entregó en mano." },
      {
        autor: "creador",
        texto: "Ya inició sesión sin problema, doy por cerrado el ticket.",
      },
    ],
  },
];

const asuntosGenerados = [
  "No puedo iniciar sesión en el portal de proveedores",
  "El monitor parpadea de forma intermitente",
  "La laptop no detecta el segundo monitor",
  "Error al generar la nómina del mes",
  "El WiFi de la sala de juntas se desconecta",
  "El escáner no aparece en el equipo",
  "La aplicación de inventarios tarda mucho en abrir",
  "Se requiere reinstalar el paquete de oficina",
  "El respaldo nocturno falló dos días seguidos",
  "La impresora no reconoce el papel tamaño carta",
  "El teclado escribe caracteres incorrectos",
  "Solicitud de buzón compartido para el equipo de compras",
  "El teléfono IP no tiene tono",
  "No se puede imprimir a doble cara",
  "El disco duro está casi lleno",
  "La cámara no funciona en las videollamadas",
  "Error de certificado al entrar al sistema interno",
  "El servidor de archivos responde lento",
  "Requerimos acceso a la carpeta de auditoría",
  "La batería del equipo dura muy poco",
  "El correo no sincroniza en el celular",
  "Falla el envío de notificaciones automáticas",
  "El lector de huellas no reconoce al usuario",
  "La cuenta se bloquea después de tres intentos",
  "El sistema de tickets no muestra los adjuntos",
  "Necesitamos una cuenta de servicio para integraciones",
  "El proyector de la sala 3 no enciende",
  "Los reportes salen sin formato",
  "El antivirus bloquea una aplicación permitida",
  "La red cableada del almacén está caída",
];

const descripcionesGeneradas = [
  "El problema se presenta desde esta mañana y afecta a todo el equipo del área.",
  "Ya reinicié el equipo y el problema continúa, por eso levanto el ticket.",
  "Ocurre de forma intermitente, aproximadamente cada dos horas.",
  "Sucede solo con mi usuario; con el de un compañero funciona bien.",
  "Empezó después de la actualización del sistema del fin de semana.",
  "Necesitamos atención antes de que cierre el corte del mes.",
  "Afecta a varias personas de la misma área, no solo a mí.",
  "Lo reporto para que quede registro, aunque por ahora hay una solución provisional.",
];

const respuestasSoporte = [
  "Recibido, estoy revisando el caso y te confirmo en cuanto tenga un diagnóstico.",
  "Ya lo estoy revisando de forma remota, en unos minutos te comparto el resultado.",
  "Gracias por el detalle. Voy a reproducir el problema en un equipo de prueba.",
  "Necesito que me confirmes si el error aparece también con otro usuario.",
];

const respuestasCreador = [
  "Sigue ocurriendo, acabo de intentarlo de nuevo.",
  "Con otro usuario sí funciona, así que parece ser mi cuenta.",
  "Perfecto, quedo pendiente de tu confirmación.",
  "Ya probé y el comportamiento es el mismo.",
];

const propuestas = [
  "Propongo reinstalar el controlador y reiniciar el equipo para descartar la configuración local.",
  "Propongo actualizar el registro del servicio y volver a publicar el recurso compartido.",
  "Propongo reemplazar el cable de red y validar el puerto del switch.",
  "Propongo ampliar el espacio del buzón y archivar los correos anteriores a dos años.",
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const hora = 60 * 60 * 1000;

const fecha = (diasAtras: number, desfaseHoras = 0) =>
  new Date(Date.now() - diasAtras * 24 * hora - desfaseHoras * hora);

const codigoTicket = (numero: number) => `${PREFIJO_CODIGO}${String(numero).padStart(3, "0")}`;

const rutaAbsoluta = (nombreAlmacenado: string) => join(UPLOADS_DIR, nombreAlmacenado);

const copiarImagen = (ticketId: string, adjuntoId: string, archivo: string) => {
  const carpeta = join(UPLOADS_DIR, "tickets", ticketId);

  mkdirSync(carpeta, { recursive: true });
  copyFileSync(join(ASSETS_DIR, archivo), join(carpeta, `${adjuntoId}.png`));

  return join("tickets", ticketId, `${adjuntoId}.png`);
};

const htmlMensaje = (texto: string, adjuntos: Array<{ id: string; alt: string }>) => {
  const imagenes = adjuntos
    .map(adjunto => `<img src="/api/adjuntos/${adjunto.id}" alt="${adjunto.alt}" />`)
    .join("");

  return `<p>${texto}</p>${imagenes}`;
};

// ---------------------------------------------------------------------------
// Limpieza
// ---------------------------------------------------------------------------

const limpiar = async () => {
  const tickets = await prisma.ticket.findMany({
    where: { codigo: { startsWith: PREFIJO_CODIGO } },
    select: { id: true },
  });
  const ids = tickets.map(ticket => ticket.id);

  if (ids.length > 0) {
    const adjuntos = await prisma.archivoAdjunto.findMany({
      where: { ticket_id: { in: ids } },
      select: { nombre_almacenado: true },
    });

    await prisma.notificacion.deleteMany({ where: { ticket_id: { in: ids } } });
    await prisma.ticket.deleteMany({ where: { id: { in: ids } } });

    for (const adjunto of adjuntos) {
      rmSync(rutaAbsoluta(adjunto.nombre_almacenado), { force: true });
    }

    for (const id of ids) {
      rmSync(join(UPLOADS_DIR, "tickets", id), { recursive: true, force: true });
    }
  }

  const usuarios = await prisma.usuario.deleteMany({
    where: { correo_electronico: { endsWith: DOMINIO_DEMO } },
  });

  return { tickets: ids.length, usuarios: usuarios.count };
};

// ---------------------------------------------------------------------------
// Creación
// ---------------------------------------------------------------------------

interface Contexto {
  categorias: string[];
  areas: string[];
  creadores: string[];
  soportes: string[];
  administrador: string;
}

const crearUsuarios = async () => {
  const roles = await prisma.rol.findMany({ select: { id: true, nombre: true } });
  const rolesPorNombre = new Map(roles.map(rol => [rol.nombre, rol.id]));
  const contrasena = await argon2.hash(CONTRASENA_DEMO, { type: argon2.argon2id });

  for (const usuario of usuariosDemo) {
    const rolId = rolesPorNombre.get(usuario.rol);

    if (!rolId) {
      throw new Error(`No se encontró el rol ${usuario.rol}`);
    }

    await prisma.usuario.upsert({
      where: { correo_electronico: usuario.correo },
      update: {
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        contrasena,
        rol_id: rolId,
        estado: EstadoUsuario.Activo,
      },
      create: {
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        correo_electronico: usuario.correo,
        contrasena,
        rol_id: rolId,
        estado: EstadoUsuario.Activo,
      },
    });
  }
};

const construirContexto = async (): Promise<Contexto> => {
  const [categorias, areas, usuarios, administrador] = await Promise.all([
    prisma.categoria.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
    prisma.area.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
    prisma.usuario.findMany({
      where: {
        OR: [
          { correo_electronico: "usuario@example.com" },
          { correo_electronico: "soporte@example.com" },
        ],
      },
      select: { id: true, correo_electronico: true },
    }),
    prisma.usuario.findUnique({
      where: { correo_electronico: "admin@example.com" },
      select: { id: true },
    }),
  ]);

  const usuarioBase = usuarios.find(
    usuario => usuario.correo_electronico === "usuario@example.com"
  );
  const soporteBase = usuarios.find(
    usuario => usuario.correo_electronico === "soporte@example.com"
  );

  if (!usuarioBase || !soporteBase || !administrador) {
    throw new Error("Ejecuta primero el seed base: faltan los usuarios de prueba");
  }

  if (categorias.length === 0 || areas.length === 0) {
    throw new Error("Ejecuta primero el seed base: faltan categorías o áreas");
  }

  const demo = await prisma.usuario.findMany({
    where: { correo_electronico: { endsWith: DOMINIO_DEMO } },
    select: { id: true, correo_electronico: true },
  });

  const idDemo = (correo: string) => {
    const encontrado = demo.find(usuario => usuario.correo_electronico === correo);

    if (!encontrado) {
      throw new Error(`No se encontró el usuario demo ${correo}`);
    }

    return encontrado.id;
  };

  return {
    categorias: categorias.map(categoria => categoria.id),
    areas: areas.map(area => area.id),
    creadores: [
      usuarioBase.id,
      ...usuariosDemo.filter(u => u.rol === NombreRol.Usuario).map(u => idDemo(u.correo)),
    ],
    soportes: [
      soporteBase.id,
      ...usuariosDemo.filter(u => u.rol === NombreRol.Soporte).map(u => idDemo(u.correo)),
    ],
    administrador: administrador.id,
  };
};

const crearTicket = async (numero: number, datos: TicketDemo, contexto: Contexto) => {
  const creadoEn = fecha(datos.diasAtras, 9);
  const asignadoId = datos.asignado === null ? null : tomar(contexto.soportes, datos.asignado);
  const creadorId = tomar(contexto.creadores, datos.creador);
  const cerrado = datos.estado === EstadoTicket.Cerrado;

  const ticket = await prisma.ticket.create({
    data: {
      codigo: codigoTicket(numero),
      asunto: datos.asunto,
      descripcion: datos.descripcion,
      prioridad: datos.prioridad,
      estado: datos.estado,
      categoria_id: tomar(contexto.categorias, datos.categoria),
      area_id: datos.area === null ? null : tomar(contexto.areas, datos.area),
      usuario_creador_id: creadorId,
      asignado_a_id: asignadoId,
      creado_en: creadoEn,
      fecha_cierre: cerrado ? new Date(creadoEn.getTime() + 2 * 24 * hora) : null,
    },
    select: { id: true, codigo: true },
  });

  const historial: Array<{
    tipo_evento: TipoEventoHistorial;
    estado_anterior: EstadoTicket | null;
    estado_nuevo: EstadoTicket | null;
    detalle: string | null;
    fecha_cambio: Date;
  }> = [
    {
      tipo_evento: TipoEventoHistorial.CREACION,
      estado_anterior: null,
      estado_nuevo: EstadoTicket.Abierto,
      detalle: null,
      fecha_cambio: creadoEn,
    },
  ];

  if (asignadoId) {
    historial.push({
      tipo_evento: TipoEventoHistorial.REASIGNACION,
      estado_anterior: null,
      estado_nuevo: null,
      detalle: "Ticket asignado a Soporte",
      fecha_cambio: new Date(creadoEn.getTime() + hora),
    });
  }

  if (datos.estado !== EstadoTicket.Abierto) {
    historial.push({
      tipo_evento: TipoEventoHistorial.CAMBIO_ESTADO,
      estado_anterior: EstadoTicket.Abierto,
      estado_nuevo: datos.estado,
      detalle: null,
      fecha_cambio: new Date(creadoEn.getTime() + 2 * hora),
    });
  }

  if (datos.estado === EstadoTicket.Cerrado) {
    historial.push({
      tipo_evento: TipoEventoHistorial.CAMBIO_ESTADO,
      estado_anterior: EstadoTicket.En_proceso,
      estado_nuevo: EstadoTicket.Cerrado,
      detalle: "Ticket cerrado",
      fecha_cambio: new Date(creadoEn.getTime() + 2 * 24 * hora),
    });
  }

  await prisma.historialTicket.createMany({
    data: historial.map(evento => ({
      ticket_id: ticket.id,
      usuario_id:
        evento.tipo_evento === TipoEventoHistorial.CREACION
          ? creadorId
          : (asignadoId ?? contexto.administrador),
      tipo_evento: evento.tipo_evento,
      estado_anterior: evento.estado_anterior,
      estado_nuevo: evento.estado_nuevo,
      detalle: evento.detalle,
      fecha_cambio: evento.fecha_cambio,
    })),
  });

  let adjuntosCreados = 0;
  let momento = creadoEn.getTime() + 3 * hora;

  for (const mensaje of datos.mensajes) {
    const autorId =
      mensaje.autor === "creador"
        ? creadorId
        : mensaje.autor === "admin"
          ? contexto.administrador
          : (asignadoId ?? tomar(contexto.soportes, 0));

    const incrustados: Array<{ id: string; alt: string }> = [];
    const sueltos: Array<{ id: string; nombre: string; incrustado: boolean }> = [];

    for (const archivo of mensaje.imagenes ?? []) {
      const id = randomUUID();

      incrustados.push({ id, alt: archivo.replace(/[-.]/g, " ").replace("png", "").trim() });
      sueltos.push({ id, nombre: archivo, incrustado: true });
    }

    if (mensaje.suelto) {
      const id = randomUUID();

      sueltos.push({ id, nombre: mensaje.suelto, incrustado: false });
    }

    const creado = new Date(momento);

    momento += 45 * 60 * 1000;

    const registro = await prisma.ticketMensaje.create({
      data: {
        ticket_id: ticket.id,
        usuario_id: autorId,
        mensaje: htmlMensaje(mensaje.texto, incrustados),
        es_nota_interna: mensaje.notaInterna ?? false,
        es_propuesta_solucion: mensaje.propuesta ?? false,
        creado_en: creado,
      },
      select: { id: true },
    });

    for (const adjunto of sueltos) {
      const nombreAlmacenado = copiarImagen(ticket.id, adjunto.id, adjunto.nombre);

      await prisma.archivoAdjunto.create({
        data: {
          id: adjunto.id,
          ticket_id: ticket.id,
          mensaje_id: registro.id,
          nombre_original: adjunto.nombre,
          nombre_almacenado: nombreAlmacenado,
          tipo_mime: "image/png",
          ruta_url: `/api/v1/adjuntos/${adjunto.id}`,
          subido_por_id: autorId,
          creado_en: creado,
        },
      });

      adjuntosCreados += 1;
    }

    if (mensaje.propuesta) {
      await prisma.historialTicket.create({
        data: {
          ticket_id: ticket.id,
          usuario_id: autorId,
          tipo_evento: TipoEventoHistorial.PROPUESTA_SOLUCION,
          estado_anterior: EstadoTicket.En_proceso,
          estado_nuevo: EstadoTicket.En_revision,
          fecha_cambio: creado,
        },
      });
    }
  }

  const ultimaActividad = new Date(momento);
  const destinatarios = new Set<string>([creadorId]);

  if (asignadoId) destinatarios.add(asignadoId);

  await prisma.notificacion.createMany({
    data: [...destinatarios].map((usuarioId, indice) => ({
      usuario_id: usuarioId,
      ticket_id: ticket.id,
      mensaje: `${ticket.codigo}: ${datos.asunto}`,
      leida: numero % 3 === 0 && indice === 0,
      creado_en: new Date(ultimaActividad.getTime() - indice * hora),
    })),
  });

  return { adjuntos: adjuntosCreados };
};

const crearHuerfanos = async (contexto: Contexto) => {
  const tickets = await prisma.ticket.findMany({
    where: { codigo: { startsWith: PREFIJO_CODIGO } },
    select: { id: true },
    orderBy: { creado_en: "desc" },
    take: 1,
  });
  const ticket = tickets[0];

  if (!ticket) return 0;

  const edades = [6, 30, 72];
  let creados = 0;

  for (const [indice, horas] of edades.entries()) {
    const id = randomUUID();
    const nombreAlmacenado = copiarImagen(ticket.id, id, IMAGEN_SUELTA);

    await prisma.archivoAdjunto.create({
      data: {
        id,
        ticket_id: ticket.id,
        mensaje_id: null,
        nombre_original: `adjunto-huerfano-${indice + 1}.png`,
        nombre_almacenado: nombreAlmacenado,
        tipo_mime: "image/png",
        ruta_url: `/api/v1/adjuntos/${id}`,
        subido_por_id: tomar(contexto.creadores, 0),
        creado_en: new Date(Date.now() - horas * hora),
      },
    });

    creados += 1;
  }

  return creados;
};

const construirGenerados = (cantidad: number): TicketDemo[] => {
  const plan = [
    ...repetir({ estado: EstadoTicket.Abierto, sinAsignar: true }, 9),
    ...repetir({ estado: EstadoTicket.Abierto, sinAsignar: false }, 7),
    ...repetir({ estado: EstadoTicket.En_proceso, sinAsignar: false }, 12),
    ...repetir({ estado: EstadoTicket.En_revision, sinAsignar: false }, 8),
    ...repetir({ estado: EstadoTicket.Resuelto, sinAsignar: false }, 8),
    ...repetir({ estado: EstadoTicket.Cerrado, sinAsignar: false }, 8),
  ].slice(0, cantidad);

  const prioridades = [
    PrioridadTicket.Media,
    PrioridadTicket.Alta,
    PrioridadTicket.Baja,
    PrioridadTicket.Critica,
  ];

  return plan.map((paso, indice) => {
    const mensajes: MensajeDemo[] = [];

    if (paso.estado === EstadoTicket.Abierto && paso.sinAsignar) {
      mensajes.push({ autor: "creador", texto: "Agradezco la revisión, quedo pendiente." });
    } else if (paso.estado === EstadoTicket.Abierto) {
      mensajes.push({
        autor: "soporte",
        texto: "Tomé el ticket, lo reviso hoy mismo.",
        notaInterna: true,
      });
    } else if (paso.estado === EstadoTicket.En_proceso) {
      mensajes.push(
        { autor: "soporte", texto: tomar(respuestasSoporte, indice) },
        { autor: "creador", texto: tomar(respuestasCreador, indice) }
      );
    } else {
      mensajes.push(
        { autor: "soporte", texto: tomar(respuestasSoporte, indice) },
        { autor: "creador", texto: tomar(respuestasCreador, indice) }
      );

      if (paso.estado === EstadoTicket.En_revision) {
        const propuesta: MensajeDemo = {
          autor: "soporte",
          texto: tomar(propuestas, indice),
          propuesta: true,
        };

        if (indice % 5 === 0) propuesta.suelto = IMAGEN_SUELTA;

        mensajes.push(propuesta);
      }
    }

    return {
      asunto: tomar(asuntosGenerados, indice),
      descripcion: tomar(descripcionesGeneradas, indice),
      estado: paso.estado,
      prioridad: tomar(prioridades, indice),
      categoria: indice % 3,
      area: indice % 2 === 0 ? 0 : null,
      creador: indice % 12,
      asignado: paso.sinAsignar ? null : indice % 5,
      diasAtras: 6 + indice,
      mensajes,
    };
  });
};

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

const argumentos = process.argv.slice(2);
const soloLimpiar = argumentos.includes("--limpiar");
const argumentoTickets = argumentos.find(argumento => argumento.startsWith("--tickets="));
const ticketsSolicitados = argumentoTickets
  ? Number(argumentoTickets.split("=")[1])
  : TICKETS_POR_DEFECTO;

const main = async () => {
  const limpieza = await limpiar();

  console.log(
    `Limpieza: ${limpieza.tickets} ticket(s) y ${limpieza.usuarios} usuario(s) demo eliminados.`
  );

  if (soloLimpiar) return;

  if (!Number.isFinite(ticketsSolicitados) || ticketsSolicitados < 1) {
    throw new Error("El valor de --tickets debe ser un número mayor que cero");
  }

  const total = Math.max(ticketsSolicitados, escenarios.length);

  await crearUsuarios();

  const contexto = await construirContexto();
  const generados = construirGenerados(total - escenarios.length);
  const todos = [...escenarios, ...generados];

  let adjuntos = 0;
  const conteo = new Map<EstadoTicket, number>();

  for (const [indice, datos] of todos.entries()) {
    const creado = await crearTicket(indice + 1, datos, contexto);

    adjuntos += creado.adjuntos;
    conteo.set(datos.estado, (conteo.get(datos.estado) ?? 0) + 1);
  }

  const huerfanos = await crearHuerfanos(contexto);

  console.log(`\nDatos de demostración listos.`);
  console.log(`  Tickets: ${todos.length}`);

  for (const estado of Object.values(EstadoTicket)) {
    console.log(`    ${estado.padEnd(11)} ${conteo.get(estado) ?? 0}`);
  }

  console.log(`  Usuarios demo: ${usuariosDemo.length} (contraseña: ${CONTRASENA_DEMO})`);
  console.log(`  Adjuntos enlazados: ${adjuntos}`);
  console.log(`  Adjuntos huérfanos: ${huerfanos} (6 h, 30 h y 72 h)`);
  console.log(`\nCredenciales:`);
  console.log(`  ${"admin@example.com".padEnd(26)} admin123`);
  console.log(`  ${"soporte@example.com".padEnd(26)} soporte123`);
  console.log(`  ${"usuario@example.com".padEnd(26)} usuario123`);

  for (const usuario of usuariosDemo) {
    console.log(`  ${usuario.correo.padEnd(26)} ${CONTRASENA_DEMO}  (${usuario.rol})`);
  }
};

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
