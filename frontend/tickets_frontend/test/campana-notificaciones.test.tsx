import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CampanaNotificaciones } from "@/components/notificaciones/campana-notificaciones";

const { listarMock, marcarLeidaMock } = vi.hoisted(() => ({
  listarMock: vi.fn(),
  marcarLeidaMock: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    sesion: {
      token: "token-123",
      usuario: {
        id: "11111111-1111-4111-8111-111111111111",
        nombre: "Cliente",
        correo_electronico: "usuario@example.com",
        rol: "Usuario",
      },
    },
    isClient: true,
  }),
}));

vi.mock("@/services/notificaciones.service", () => ({
  notificacionesService: {
    listar: listarMock,
    marcarLeida: marcarLeidaMock,
    marcarTodas: vi.fn(),
  },
}));

const notificacion = {
  id: "n1",
  ticket_id: "t1",
  mensaje: "Se te asignó un ticket",
  leida: false,
  creado_en: "2026-11-04T10:00:00.000Z",
  ticket: { id: "t1", codigo: "#TK-001", asunto: "No enciende", estado: "Abierto" as const },
};

beforeEach(() => {
  listarMock.mockReset();
  marcarLeidaMock.mockReset();
  marcarLeidaMock.mockResolvedValue({ message: "ok" });
});

describe("CampanaNotificaciones", () => {
  it("muestra el contador de no leídas", async () => {
    listarMock.mockResolvedValue({ data: [notificacion], meta: { total: 1, no_leidas: 1 } });

    render(<CampanaNotificaciones />);

    expect(
      await screen.findByRole("button", { name: "Notificaciones, 1 sin leer" })
    ).toBeInTheDocument();
  });

  it("no muestra contador cuando todo está leído", async () => {
    listarMock.mockResolvedValue({
      data: [{ ...notificacion, leida: true }],
      meta: { total: 1, no_leidas: 0 },
    });

    render(<CampanaNotificaciones />);

    expect(await screen.findByRole("button", { name: "Notificaciones" })).toBeInTheDocument();
  });

  it("marca como leída al abrir una notificación", async () => {
    const user = userEvent.setup();

    listarMock.mockResolvedValue({ data: [notificacion], meta: { total: 1, no_leidas: 1 } });

    render(<CampanaNotificaciones />);

    await user.click(await screen.findByRole("button", { name: "Notificaciones, 1 sin leer" }));
    await user.click(await screen.findByText("Se te asignó un ticket"));

    await waitFor(() => expect(marcarLeidaMock).toHaveBeenCalledWith("n1"));
  });

  it("muestra un estado vacío", async () => {
    const user = userEvent.setup();

    listarMock.mockResolvedValue({ data: [], meta: { total: 0, no_leidas: 0 } });

    render(<CampanaNotificaciones />);

    await user.click(await screen.findByRole("button", { name: "Notificaciones" }));

    expect(await screen.findByText("No tienes notificaciones.")).toBeInTheDocument();
  });
});
