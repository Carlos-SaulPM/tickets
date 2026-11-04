import { describe, expect, it } from "vitest";

import {
  contarImagenes,
  errorImagen,
  LIMITE_IMAGENES,
  obtenerIdsAdjuntos,
  TAMANO_MAXIMO_IMAGEN,
} from "@/lib/adjuntos";

const ID_UNO = "11111111-1111-4111-8111-111111111111";
const ID_DOS = "22222222-2222-4222-8222-222222222222";

const archivo = (tipo: string, tamano: number) => {
  const creado = new File(["contenido"], "foto.png", { type: tipo });

  Object.defineProperty(creado, "size", { value: tamano });

  return creado;
};

describe("errorImagen", () => {
  it("acepta imágenes dentro del límite", () => {
    expect(errorImagen(archivo("image/png", 1024))).toBeNull();
  });

  it("rechaza archivos que no son imagen", () => {
    expect(errorImagen(archivo("application/pdf", 1024))).toBe("Solo se permiten imágenes");
  });

  it("rechaza imágenes que superan los 5 MB", () => {
    expect(errorImagen(archivo("image/png", TAMANO_MAXIMO_IMAGEN + 1))).toBe(
      "La imagen supera los 5 MB"
    );
  });
});

describe("contarImagenes", () => {
  it("cuenta las imágenes del HTML", () => {
    expect(contarImagenes(`<p>texto</p><img src="/api/adjuntos/${ID_UNO}" />`)).toBe(1);
    expect(contarImagenes("<p>solo texto</p>")).toBe(0);
  });
});

describe("obtenerIdsAdjuntos", () => {
  it("extrae los ids de las rutas del proxy", () => {
    const html = `<p>Hola</p><img src="/api/adjuntos/${ID_UNO}" alt="uno" /><img src="/api/adjuntos/${ID_DOS}" alt="dos" />`;

    expect(obtenerIdsAdjuntos(html)).toEqual([ID_UNO, ID_DOS]);
  });

  it("extrae los ids de las rutas de la API", () => {
    expect(obtenerIdsAdjuntos(`<img src="/api/v1/adjuntos/${ID_UNO}" alt="uno" />`)).toEqual([
      ID_UNO,
    ]);
  });

  it("no repite un id incrustado dos veces", () => {
    const html = `<img src="/api/adjuntos/${ID_UNO}" /><img src="/api/v1/adjuntos/${ID_UNO}" />`;

    expect(obtenerIdsAdjuntos(html)).toEqual([ID_UNO]);
  });

  it("ignora los adjuntos que ya no están en el HTML", () => {
    expect(obtenerIdsAdjuntos("<p>El usuario borró la imagen</p>")).toEqual([]);
  });

  it("extrae todos los ids, aunque superen el límite de la interfaz", () => {
    const html = Array.from(
      { length: LIMITE_IMAGENES + 1 },
      (_, indice) => `<img src="/api/adjuntos/0000000${indice}-0000-4000-8000-000000000000" />`
    ).join("");

    expect(obtenerIdsAdjuntos(html)).toHaveLength(LIMITE_IMAGENES + 1);
  });
});
