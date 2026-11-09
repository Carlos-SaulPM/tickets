import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormularioLogin } from "@/components/auth/formulario-login";
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
  useAuth: () => ({ sesion: null, isClient: true }),
}));

beforeEach(() => {
  loginMock.mockReset();
  replaceMock.mockReset();
});

describe("FormularioLogin", () => {
  it("inicia sesión y redirige a tickets", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Admin",
      correo_electronico: "admin@example.com",
      rol: "Administrador",
    });

    render(<FormularioLogin />);

    await user.type(screen.getByLabelText("Correo electrónico"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "admin123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        correo_electronico: "admin@example.com",
        contrasena: "admin123",
      });
    });
    expect(replaceMock).toHaveBeenCalledWith("/tickets");
  });

  it("redirige a tickets con cualquier rol", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
      nombre: "Soporte",
      correo_electronico: "soporte@example.com",
      rol: "Soporte",
    });

    render(<FormularioLogin />);

    await user.type(screen.getByLabelText("Correo electrónico"), "soporte@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "soporte123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/tickets"));
  });

  it("muestra el error del backend", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new ApiError("Credenciales inválidas", 401));

    render(<FormularioLogin />);

    await user.type(screen.getByLabelText("Correo electrónico"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciales inválidas");
  });

  it("avisa cuando la sesión anterior expiró", () => {
    render(<FormularioLogin motivo="expirada" />);

    expect(screen.getByRole("status")).toHaveTextContent("Tu sesión expiró");
  });

  it("permite mostrar y ocultar la contraseña", async () => {
    const user = userEvent.setup();
    render(<FormularioLogin />);

    const campo = screen.getByLabelText("Contraseña");

    expect(campo).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(campo).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(campo).toHaveAttribute("type", "password");
  });

  it("limpia el error al escribir de nuevo", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new ApiError("Credenciales inválidas", 401));

    render(<FormularioLogin />);

    await user.type(screen.getByLabelText("Correo electrónico"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Correo electrónico"), "x");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
