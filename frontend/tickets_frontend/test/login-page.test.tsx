import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";
import { ApiError } from "@/lib/api";

const { loginMock, replaceMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/services/auth.service", () => ({
  authService: { login: loginMock },
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ session: null, isClient: true }),
}));

beforeEach(() => {
  loginMock.mockReset();
  replaceMock.mockReset();
});

describe("LoginPage", () => {
  it("inicia sesión como Administrador y redirige a usuarios", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Admin",
      correo_electronico: "admin@example.com",
      rol: "Administrador",
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Correo electrónico"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "admin123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        correo_electronico: "admin@example.com",
        contrasena: "admin123",
      });
    });
    expect(replaceMock).toHaveBeenCalledWith("/users");
  });

  it("redirige a perfil cuando el rol no es Administrador", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
      nombre: "Soporte",
      correo_electronico: "soporte@example.com",
      rol: "Soporte",
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Correo electrónico"), "soporte@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "soporte123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/perfil"));
  });

  it("muestra el error del backend", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new ApiError("Credenciales inválidas", 401));

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Correo electrónico"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciales inválidas");
  });
});
