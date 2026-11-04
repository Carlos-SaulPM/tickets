import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContenidoMensaje } from "@/components/tickets/contenido-mensaje";

const adjunto = {
  id: "11111111-1111-4111-8111-111111111111",
  nombre_original: "foto.png",
  tipo_mime: "image/png",
  ruta_url: "/api/v1/adjuntos/11111111-1111-4111-8111-111111111111",
};

describe("ContenidoMensaje", () => {
  it("muestra texto plano conservando saltos de línea", () => {
    render(<ContenidoMensaje contenido={"Primera línea\nSegunda línea"} adjuntos={[]} />);

    expect(screen.getByText(/Primera línea/)).toHaveTextContent("Primera línea Segunda línea");
  });

  it("renderiza HTML permitido", () => {
    const { container } = render(
      <ContenidoMensaje contenido="<p>Hola <strong>equipo</strong></p>" adjuntos={[]} />
    );

    expect(container.querySelector("strong")).toHaveTextContent("equipo");
  });

  it("lista los adjuntos que no están dentro del contenido", () => {
    render(<ContenidoMensaje contenido="<p>Sin imagen</p>" adjuntos={[adjunto]} />);

    expect(screen.getByRole("img", { name: "foto.png" })).toBeInTheDocument();
  });

  it("no duplica la imagen que el editor guardó con la ruta del proxy", () => {
    render(
      <ContenidoMensaje
        contenido={`<p><img src="/api/adjuntos/${adjunto.id}" alt="foto"></p>`}
        adjuntos={[adjunto]}
      />
    );

    expect(screen.queryByRole("img", { name: "foto.png" })).not.toBeInTheDocument();
  });

  it("no duplica la imagen guardada con la ruta de la API", () => {
    render(
      <ContenidoMensaje
        contenido={`<p><img src="${adjunto.ruta_url}" alt="foto"></p>`}
        adjuntos={[adjunto]}
      />
    );

    expect(screen.queryByRole("img", { name: "foto.png" })).not.toBeInTheDocument();
  });

  it("lista solo los adjuntos ausentes del HTML", () => {
    const otro = {
      ...adjunto,
      id: "22222222-2222-4222-8222-222222222222",
      nombre_original: "otra.png",
      ruta_url: "/api/v1/adjuntos/22222222-2222-4222-8222-222222222222",
    };

    render(
      <ContenidoMensaje
        contenido={`<p><img src="/api/adjuntos/${adjunto.id}" alt="foto"></p>`}
        adjuntos={[adjunto, otro]}
      />
    );

    expect(screen.getByRole("img", { name: "otra.png" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "foto.png" })).not.toBeInTheDocument();
  });
});
