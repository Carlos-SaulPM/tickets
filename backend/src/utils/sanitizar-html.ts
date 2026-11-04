import sanitizeHtml from "sanitize-html";

const OPCIONES: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  transformTags: {
    a: (etiqueta, atributos) => ({
      tagName: etiqueta,
      attribs: { ...atributos, rel: "noopener noreferrer", target: "_blank" },
    }),
  },
};

export const sanitizarHtml = (html: string) => sanitizeHtml(html, OPCIONES);
