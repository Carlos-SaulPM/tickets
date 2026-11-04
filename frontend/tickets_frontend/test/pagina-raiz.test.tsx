import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";

const { redirectMock, sesionMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  sesionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/lib/server/sesion", () => ({
  obtenerSesionServidor: sesionMock,
}));

const sesion = {
  token: "token-123",
  usuario: {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Cliente",
    correo_electronico: "usuario@example.com",
    rol: "Usuario" as const,
  },
};

beforeEach(() => {
  redirectMock.mockReset();
  sesionMock.mockReset();
});

describe("Página raíz", () => {
  it("manda a login cuando no hay sesión", async () => {
    sesionMock.mockResolvedValue(null);

    await Home();

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("manda a los tickets cuando hay sesión", async () => {
    sesionMock.mockResolvedValue(sesion);

    await Home();

    expect(redirectMock).toHaveBeenCalledWith("/tickets");
  });
});
