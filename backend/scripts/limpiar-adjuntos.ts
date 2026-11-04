import "dotenv/config";

import { existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es requerida para limpiar adjuntos");
}

const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR ?? "./uploads");
const HORAS_POR_DEFECTO = 24;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const main = async () => {
  const horas = Number(process.argv[2] ?? HORAS_POR_DEFECTO);

  if (!Number.isFinite(horas) || horas <= 0) {
    throw new Error("Indica un número de horas mayor que cero, por ejemplo: 24");
  }

  const limite = new Date(Date.now() - horas * 60 * 60 * 1000);

  const huerfanos = await prisma.archivoAdjunto.findMany({
    where: { mensaje_id: null, creado_en: { lt: limite } },
    select: { id: true, nombre_original: true, nombre_almacenado: true },
    orderBy: { creado_en: "asc" },
  });

  if (huerfanos.length === 0) {
    console.log(`No hay adjuntos huérfanos con más de ${horas} hora(s).`);
    return;
  }

  let archivosBorrados = 0;

  for (const adjunto of huerfanos) {
    const ruta = join(UPLOADS_DIR, adjunto.nombre_almacenado);

    if (!existsSync(ruta)) continue;

    rmSync(ruta);
    archivosBorrados += 1;

    console.log(`  · ${adjunto.nombre_original} (${adjunto.id})`);
  }

  const { count } = await prisma.archivoAdjunto.deleteMany({
    where: { id: { in: huerfanos.map(adjunto => adjunto.id) } },
  });

  console.log(
    `${count} adjunto(s) eliminado(s) de la base y ${archivosBorrados} archivo(s) borrado(s) del disco.`
  );
};

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
