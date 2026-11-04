import { describe, expect, it } from "vitest";

import { sanitizarHtml } from "@/utils/sanitizar-html";

describe("sanitizarHtml", () => {
  it("conserva las etiquetas permitidas", () => {
    const html = "<p>Hola <strong>equipo</strong> y <em>gracias</em></p>";

    expect(sanitizarHtml(html)).toBe(html);
  });

  it("elimina scripts y manejadores de eventos", () => {
    const html =
      '<p>Hola</p><script>alert("x")</script><img src="/api/v1/adjuntos/1" onerror="alert(1)">';

    const limpio = sanitizarHtml(html);

    expect(limpio).not.toContain("<script");
    expect(limpio).not.toContain("onerror");
    expect(limpio).toContain("<p>Hola</p>");
  });

  it("fuerza rel y target seguros en enlaces", () => {
    const limpio = sanitizarHtml('<a href="https://example.com">Ver</a>');

    expect(limpio).toContain('rel="noopener noreferrer"');
    expect(limpio).toContain('target="_blank"');
  });

  it("rechaza esquemas peligrosos", () => {
    const limpio = sanitizarHtml('<a href="javascript:alert(1)">x</a>');

    expect(limpio).not.toContain("javascript:");
  });

  it("permite imágenes relativas del API", () => {
    const limpio = sanitizarHtml('<img src="/api/v1/adjuntos/abc" alt="Foto del cable">');

    expect(limpio).toContain('src="/api/v1/adjuntos/abc"');
    expect(limpio).toContain('alt="Foto del cable"');
  });
});
