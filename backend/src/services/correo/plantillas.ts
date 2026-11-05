import type { PlantillaCorreo } from "./tipos";

interface ContenidoCorreo {
  html: string;
  texto: string;
}

const dato = (datos: Record<string, unknown>, clave: string) => {
  const valor = datos[clave];

  return typeof valor === "string" ? valor : "";
};

const ENVOLTURA = (titulo: string, cuerpo: string) => `
  <div style="background:#f5f7fa;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1b2333">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e6ef;border-radius:12px;overflow:hidden">
      <div style="background:#2a53b3;padding:18px 24px;color:#ffffff;font-size:16px;font-weight:600">
        Sistema de Tickets
      </div>
      <div style="padding:24px">
        <h2 style="margin:0 0 12px;font-size:18px">${titulo}</h2>
        ${cuerpo}
      </div>
      <div style="border-top:1px solid #e2e6ef;padding:16px 24px;font-size:12px;color:#6b7385">
        Este aviso se generó automáticamente. No respondas a este correo.
      </div>
    </div>
  </div>
`;

const boton = (enlace: string) =>
  enlace
    ? `<p style="margin:20px 0 0">
         <a href="${enlace}" style="background:#2a53b3;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px">
           Ver el ticket
         </a>
       </p>`
    : "";

const detalle = (mensaje: string) =>
  `<p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:#374151">${mensaje}</p>`;

interface Plantilla {
  titulo: string;
  texto: (ticket: string, mensaje: string) => string;
}

const PLANTILLAS: Record<PlantillaCorreo, Plantilla> = {
  MENSAJE_NUEVO: {
    titulo: "Nueva respuesta en tu ticket",
    texto: (ticket, mensaje) => `El ticket ${ticket} tiene una respuesta nueva. ${mensaje}`,
  },
  SOLUCION_PROPUESTA: {
    titulo: "Hay una solución para revisar",
    texto: (ticket, mensaje) =>
      `Soporte propuso una solución para el ticket ${ticket}. Revísala y decide si la apruebas. ${mensaje}`,
  },
  ESTADO_CAMBIADO: {
    titulo: "Tu ticket tiene novedades",
    texto: (ticket, mensaje) => `El ticket ${ticket} cambió. ${mensaje}`,
  },
};

export const construirCorreo = (
  plantilla: PlantillaCorreo,
  datos: Record<string, unknown>,
  enlace: string
): ContenidoCorreo => {
  const { titulo, texto } = PLANTILLAS[plantilla];
  const codigo = dato(datos, "ticket");
  const mensaje = dato(datos, "mensaje");
  const cuerpo = texto(codigo, mensaje).replace(/\s+/g, " ").trim();

  return {
    html: ENVOLTURA(
      titulo,
      `${detalle(mensaje)}<p style="margin:12px 0 0;font-size:13px;color:#6b7385">Ticket ${codigo}</p>${boton(enlace)}`
    ),
    texto: `${cuerpo}${enlace ? `\n\n${enlace}` : ""}`,
  };
};
