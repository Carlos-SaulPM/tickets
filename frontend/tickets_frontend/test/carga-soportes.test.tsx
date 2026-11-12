import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CargaSoportes } from "@/components/analiticas/carga-soportes";

describe("CargaSoportes", () => {
  it("muestra la carga por Soporte", () => {
    render(
      <CargaSoportes
        soportes={[
          { id: "s1", nombre: "Ana", apellido_paterno: "López", activos: 4 },
          { id: "s2", nombre: "Luis", apellido_paterno: "Pérez", activos: 2 },
        ]}
      />
    );

    expect(screen.getByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
  });

  it("muestra el estado vacío", () => {
    render(<CargaSoportes soportes={[]} />);

    expect(screen.getByText(/No hay tickets activos asignados/)).toBeInTheDocument();
  });
});
