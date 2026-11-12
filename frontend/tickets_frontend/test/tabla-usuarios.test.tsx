import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TablaUsuarios } from "@/components/usuarios/tabla-usuarios";
import type { Usuario } from "@/types/usuario.types";

const { navegarMock, crearMock } = vi.hoisted(() => ({
  navegarMock: vi.fn(),
  crearMock: vi.fn(),
}));

const usuarios: Usuario[] = [
  {
    id: "u1",
    nombre: "Ana",
    apellido_paterno: "López",
    apellido_materno: "Ruiz",
    correo_electronico: "ana@example.com",
    rol: { id: "r1", nombre: "Soporte" },
    estado: "Activo",
    creado_en: "2026-11-01T00:00:00.000Z",
  },
];

const meta = { pagina: 1, limite: 10, total: 25, total_paginas: 3 };

const propsBase = {
  usuarios,
  meta,
  filtros: { buscar: "", estado: "todos" },
  alNavegar: navegarMock,
  alEditar: vi.fn(),
  alRestablecer: vi.fn(),
  alEliminar: vi.fn(),
  alReactivar: vi.fn(),
  alCrear: crearMock,
};

beforeEach(() => {
  navegarMock.mockReset();
  crearMock.mockReset();
});

describe("TablaUsuarios", () => {
  it("navega a la página siguiente", async () => {
    const user = userEvent.setup();

    render(<TablaUsuarios {...propsBase} />);

    await user.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(navegarMock).toHaveBeenCalledWith({ pagina: 2 });
  });

  it("envía la búsqueda al servidor", async () => {
    const user = userEvent.setup();

    render(<TablaUsuarios {...propsBase} />);

    await user.type(screen.getByLabelText("Buscar"), "ana");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(navegarMock).toHaveBeenCalledWith({ buscar: "ana", pagina: 1 });
  });

  it("restablece la contraseña desde la fila", async () => {
    const user = userEvent.setup();

    render(<TablaUsuarios {...propsBase} />);

    await user.click(screen.getAllByRole("button", { name: "Contraseña" })[0]);

    expect(propsBase.alRestablecer).toHaveBeenCalledWith(usuarios[0]);
  });

  it("muestra el total que devuelve el servidor", () => {
    render(<TablaUsuarios {...propsBase} />);

    expect(screen.getByText(/25 usuarios/)).toBeInTheDocument();
  });
});
