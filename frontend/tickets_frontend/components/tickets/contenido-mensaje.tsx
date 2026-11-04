import Image from "next/image";

import type { Adjunto } from "@/types/ticket.types";

const esHtml = (texto: string) => /<\/?[a-z][\s\S]*>/i.test(texto);

const CLASES_CONTENIDO =
  "contenido-ticket text-sm [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_blockquote]:border-muted-foreground/40 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_a]:underline [&_img]:mt-2 [&_img]:max-h-80 [&_img]:rounded [&_img]:border";

export function ContenidoMensaje({
  contenido,
  adjuntos,
}: {
  contenido: string;
  adjuntos: Adjunto[];
}) {
  // Compara por id: el editor guarda `/api/adjuntos/<id>` (proxy de Next) y la API expone
  // `/api/v1/adjuntos/<id>`, así que la URL no sirve para saber si ya está incrustado.
  const adjuntosSueltos = adjuntos.filter(adjunto => !contenido.includes(adjunto.id));

  return (
    <div className="space-y-2">
      {esHtml(contenido) ? (
        <div
          className={CLASES_CONTENIDO}
          // El backend sanea el HTML con lista blanca antes de guardarlo.
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap">{contenido}</p>
      )}

      {adjuntosSueltos.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {adjuntosSueltos.map(adjunto =>
            adjunto.tipo_mime?.startsWith("image/") ? (
              <li key={adjunto.id}>
                <a href={`/api/adjuntos/${adjunto.id}`} target="_blank" rel="noreferrer">
                  <Image
                    src={`/api/adjuntos/${adjunto.id}`}
                    alt={adjunto.nombre_original}
                    width={320}
                    height={240}
                    unoptimized
                    className="h-auto max-h-40 w-auto rounded border"
                  />
                </a>
              </li>
            ) : (
              <li key={adjunto.id}>
                <a href={`/api/adjuntos/${adjunto.id}`} className="text-sm underline">
                  {adjunto.nombre_original}
                </a>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
