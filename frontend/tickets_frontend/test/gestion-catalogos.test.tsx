import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GestionCatalogos } from "@/components/catalogos/gestion-catalogos";

const {
  crearAreaMock,
  actualizarAreaMock,
  eliminarAreaMock,
  crearCategoriaMock,
  actualizarCategoriaMock,
  eliminarCategoriaMock,
  refreshMock,
  replaceMock,
  logoutMock,
} = vi.hoisted(() => ({
  crearAreaMock: vi.fn(),
  actualizarAreaMock: vi.fn(),
  eliminarAreaMock: vi.fn(),
  crearCategoriaMock: vi.fn(),
  actualizarCategoriaMock: vi.fn(),
  eliminarCategoriaMock: vi.fn(),
  refreshMock: vi.fn(),
  replaceMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, replace: replaceMock }),
}));

vi.mock("@/services/catalogos.service", () => ({
  catalogosService: {
    crearArea: crearAreaMock,
    actualizarArea: actualizarAreaMock,
    eliminarArea: eliminarAreaMock,
    crearCategoria: crearCategoriaMock,
    actualizarCategoria: actualizarCategoriaMock,
    eliminarCategoria: eliminarCategoriaMock,
  },
}));

vi.mock("@/services/auth.service", () => ({
  authService: { logout: logoutMock },
}));

const areas = [{ id: "a1", nombre: "Sistemas", activo: true }];

const categorias = [
  { id: "c1", nombre: "Hardware", descripcion: "Equipos y periféricos", activo: true },
];

beforeEach(() => {
  crearAreaMock.mockReset();
  actualizarAreaMock.mockReset();
  eliminarAreaMock.mockReset();
  crearCategoriaMock.mockReset();
  actualizarCategoriaMock.mockReset();
  eliminarCategoriaMock.mockReset();
  refreshMock.mockReset();
  replaceMock.mockReset();
  logoutMock.mockReset();
});

describe("GestionCatalogos", () => {
  it("crea un área", async () => {
    const user = userEvent.setup();
    crearAreaMock.mockResolvedValue({});

    render(<GestionCatalogos areas={areas} categorias={categorias} />);

    await user.click(screen.getByRole("button", { name: "Nueva área" }));
    await user.type(screen.getByLabelText("Nombre"), "Almacén");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(crearAreaMock).toHaveBeenCalledWith({ nombre: "Almacén", activo: true })
    );
    expect(refreshMock).toHaveBeenCalled();
  });

  it("edita un área existente", async () => {
    const user = userEvent.setup();
    actualizarAreaMock.mockResolvedValue({});

    render(<GestionCatalogos areas={areas} categorias={categorias} />);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const nombre = screen.getByLabelText("Nombre");
    await user.clear(nombre);
    await user.type(nombre, "Sistemas y red");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(actualizarAreaMock).toHaveBeenCalledWith("a1", {
        nombre: "Sistemas y red",
        activo: true,
      })
    );
  });

  it("elimina un área tras confirmar", async () => {
    const user = userEvent.setup();
    eliminarAreaMock.mockResolvedValue({});

    render(<GestionCatalogos areas={areas} categorias={categorias} />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await user.click(await screen.findByRole("button", { name: "Sí, eliminar" }));

    await waitFor(() => expect(eliminarAreaMock).toHaveBeenCalledWith("a1"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("crea una categoría con descripción", async () => {
    const user = userEvent.setup();
    crearCategoriaMock.mockResolvedValue({});

    render(<GestionCatalogos areas={areas} categorias={categorias} />);

    await user.click(screen.getByRole("tab", { name: "Categorías" }));
    await user.click(screen.getByRole("button", { name: "Nueva categoría" }));
    await user.type(screen.getByLabelText("Nombre"), "Red");
    await user.type(screen.getByLabelText("Descripción"), "Conectividad");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(crearCategoriaMock).toHaveBeenCalledWith({
        nombre: "Red",
        descripcion: "Conectividad",
        activo: true,
      })
    );
  });

  it("desactiva un área", async () => {
    const user = userEvent.setup();
    actualizarAreaMock.mockResolvedValue({});

    render(<GestionCatalogos areas={areas} categorias={categorias} />);

    await user.click(screen.getByRole("button", { name: "Desactivar" }));

    await waitFor(() => expect(actualizarAreaMock).toHaveBeenCalledWith("a1", { activo: false }));
  });
});
