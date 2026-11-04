export const LIMITE_IMAGENES = 5;
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

const PATRON_ADJUNTO =
  /\/api\/(?:v1\/)?adjuntos\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

export const errorImagen = (archivo: File) => {
  if (!archivo.type.startsWith("image/")) {
    return "Solo se permiten imágenes";
  }

  if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
    return "La imagen supera los 5 MB";
  }

  return null;
};

export const contarImagenes = (html: string) => (html.match(/<img\b/gi) ?? []).length;

/**
 * Los ids se derivan del HTML y no de un estado aparte: así el mensaje solo enlaza
 * las imágenes que siguen visibles en el editor.
 */
export const obtenerIdsAdjuntos = (html: string) => {
  const ids = new Set<string>();

  for (const coincidencia of html.matchAll(PATRON_ADJUNTO)) {
    const id = coincidencia[1];

    if (id) ids.add(id.toLowerCase());
  }

  return [...ids];
};
