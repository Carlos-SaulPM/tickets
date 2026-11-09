import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarcaLogin } from "@/components/auth/marca-login";
import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";

describe("MarcaLogin", () => {
  it("muestra el nombre del sistema en la versión compacta", () => {
    render(<MarcaLogin variante="compacta" />);

    expect(screen.getByText(NOMBRE_SISTEMA)).toBeInTheDocument();
  });

  it("muestra el nombre, la descripción y el ciclo de estados en el panel", () => {
    render(<MarcaLogin variante="panel" />);

    expect(screen.getByText(NOMBRE_SISTEMA)).toBeInTheDocument();
    expect(screen.getByText(DESCRIPCION_SISTEMA)).toBeInTheDocument();
    expect(screen.getByText("El ciclo de un ticket")).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
  });
});
