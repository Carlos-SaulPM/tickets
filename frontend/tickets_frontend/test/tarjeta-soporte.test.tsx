import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TarjetaSoporte } from "@/components/tickets/tarjeta-soporte";

const soporte = {
  id: "22222222-2222-4222-8222-222222222222",
  nombre: "Ana",
  apellido_paterno: "Soporte",
  correo_electronico: "ana@example.com",
};

describe("TarjetaSoporte", () => {
  it("indica cuando el ticket no tiene asignado", () => {
    render(<TarjetaSoporte asignado={null} desde={null} />);

    expect(screen.getByText(/Aún sin asignar/)).toBeInTheDocument();
  });

  it("muestra nombre, correo y fecha de asignación", () => {
    render(<TarjetaSoporte asignado={soporte} desde="2026-11-03T16:42:00.000Z" />);

    expect(screen.getByText("Ana Soporte")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ana@example.com/ })).toHaveAttribute(
      "href",
      "mailto:ana@example.com"
    );
    expect(screen.getByText(/Atiende desde/)).toBeInTheDocument();
  });
});
