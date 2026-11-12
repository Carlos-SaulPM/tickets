import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FiltrosAnaliticas } from "@/components/analiticas/filtros-analiticas";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const propsBase = {
  desde: "",
  hasta: "",
  areaId: "",
  categoriaId: "",
  asignadoId: "",
  areas: [{ id: "a1", nombre: "Sistemas", activo: true }],
  categorias: [{ id: "c1", nombre: "Hardware", descripcion: null, activo: true }],
  soportes: [{ id: "s1", nombre: "Ana", apellido_paterno: "López" }],
  mostrarSoportes: true,
};

beforeEach(() => {
  pushMock.mockReset();
});

describe("FiltrosAnaliticas", () => {
  it("aplica el rango de fechas y el área", async () => {
    const user = userEvent.setup();

    render(<FiltrosAnaliticas {...propsBase} />);

    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-11-01" } });
    await user.click(screen.getByRole("combobox", { name: "Área" }));
    await user.click(await screen.findByRole("option", { name: "Sistemas" }));
    await user.click(screen.getByRole("button", { name: "Aplicar filtros" }));

    expect(pushMock).toHaveBeenCalledWith("/analiticas?desde=2026-11-01&area_id=a1");
  });

  it("limpia los filtros", async () => {
    const user = userEvent.setup();

    render(<FiltrosAnaliticas {...propsBase} />);

    await user.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(pushMock).toHaveBeenCalledWith("/analiticas");
  });
});
