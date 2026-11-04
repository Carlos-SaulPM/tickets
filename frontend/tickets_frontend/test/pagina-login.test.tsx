import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

const { redirectMock, sesionMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  sesionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/lib/server/sesion", () => ({
  obtenerSesionServidor: sesionMock,
}));

vi.mock("@/components/auth/formulario-login", () => ({
  FormularioLogin: () => null,
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

describe("Página de login", () => {
  it("redirige a los tickets cuando ya hay sesión", async () => {
    sesionMock.mockResolvedValue(sesion);

    await LoginPage();

    expect(redirectMock).toHaveBeenCalledWith("/tickets");
  });

  it("muestra el formulario cuando no hay sesión", async () => {
    sesionMock.mockResolvedValue(null);

    const pagina = await LoginPage();

    expect(redirectMock).not.toHaveBeenCalled();
    expect(pagina).toBeTruthy();
  });
});
