import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormularioTicket } from "@/components/tickets/formulario-ticket";

const { createMock, pushMock, refreshMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: refreshMock }),
}));

vi.mock("@/services/tickets.service", () => ({
  ticketsService: { crear: createMock, agregarMensaje: vi.fn() },
}));

vi.mock("@/services/auth.service", () => ({
  authService: { logout: vi.fn() },
}));

const categorias = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Hardware",
    descripcion: null,
    activo: true,
  },
];
const areas = [{ id: "22222222-2222-4222-8222-222222222222", nombre: "Sistemas", activo: true }];

beforeEach(() => {
  createMock.mockReset();
  pushMock.mockReset();
  refreshMock.mockReset();
});

describe("FormularioTicket", () => {
  it("muestra los errores cuando faltan campos obligatorios", async () => {
    const user = userEvent.setup();

    render(<FormularioTicket categorias={categorias} areas={areas} />);

    await user.click(screen.getByRole("button", { name: "Crear ticket" }));

    expect(await screen.findByText("El asunto es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La descripción es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una categoría")).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("crea el ticket y navega al detalle", async () => {
    const user = userEvent.setup();
    createMock.mockResolvedValue({ id: "33333333-3333-4333-8333-333333333333", codigo: "#TK-009" });

    render(<FormularioTicket categorias={categorias} areas={areas} />);

    await user.type(screen.getByLabelText(/^Asunto/), "No enciende la computadora");
    await user.type(screen.getByLabelText(/^Descripción/), "No enciende desde ayer.");

    await user.click(screen.getByRole("combobox", { name: "Categoría" }));
    await user.click(await screen.findByRole("option", { name: "Hardware" }));

    await user.click(screen.getByRole("button", { name: "Crear ticket" }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        asunto: "No enciende la computadora",
        descripcion: "No enciende desde ayer.",
        categoria_id: categorias[0]?.id,
        prioridad: "Media",
        area_id: undefined,
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/tickets/33333333-3333-4333-8333-333333333333");
    expect(refreshMock).toHaveBeenCalled();
    expect(screen.getByLabelText(/^Asunto/)).toHaveValue("");
    expect(screen.getByLabelText(/^Descripción/)).toHaveValue("");
  });
});
