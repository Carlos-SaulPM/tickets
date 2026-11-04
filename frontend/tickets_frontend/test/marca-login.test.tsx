import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarcaLogin } from "@/components/auth/marca-login";
import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";

describe("MarcaLogin", () => {
  it("muestra el nombre del sistema en la versión compacta", () => {
    render(<MarcaLogin variante="compacta" />);

    expect(screen.getByText(NOMBRE_SISTEMA)).toBeInTheDocument();
  });

  it("muestra el nombre, la descripción y los beneficios en el panel", () => {
    render(<MarcaLogin variante="panel" />);

    expect(screen.getByText(NOMBRE_SISTEMA)).toBeInTheDocument();
    expect(screen.getByText(DESCRIPCION_SISTEMA)).toBeInTheDocument();
    expect(screen.getByText(/Adjunta capturas/)).toBeInTheDocument();
    expect(screen.getByText(/Recibe un aviso/)).toBeInTheDocument();
  });
});
