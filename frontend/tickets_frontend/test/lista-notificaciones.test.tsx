import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ListaNotificaciones } from "@/components/notificaciones/lista-notificaciones";

const { marcarTodasMock, marcarLeidaMock, refreshMock } = vi.hoisted(() => ({
  marcarTodasMock: vi.fn(),
  marcarLeidaMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/services/notificaciones.service", () => ({
  notificacionesService: {
    listar: vi.fn(),
    marcarTodas: marcarTodasMock,
    marcarLeida: marcarLeidaMock,
  },
}));

const notificacion = {
  id: "n1",
  ticket_id: "t1",
  mensaje: "Se propuso una solución a tu ticket",
  leida: false,
  creado_en: "2026-11-04T10:00:00.000Z",
  ticket: { id: "t1", codigo: "#TK-001", asunto: "No enciende", estado: "En_revision" as const },
};

beforeEach(() => {
  marcarTodasMock.mockReset();
  marcarLeidaMock.mockReset();
  refreshMock.mockReset();
  marcarTodasMock.mockResolvedValue({ data: { actualizadas: 1 } });
  marcarLeidaMock.mockResolvedValue({ message: "ok" });
});

describe("ListaNotificaciones", () => {
  it("enlaza la notificación con su ticket", () => {
    render(<ListaNotificaciones notificaciones={[notificacion]} noLeidas={1} />);

    expect(screen.getByText("Se propuso una solución a tu ticket")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "#TK-001" })).toHaveAttribute("href", "/tickets/t1");
    expect(screen.getByText("En revisión")).toBeInTheDocument();
  });

  it("marca una notificación como leída", async () => {
    const user = userEvent.setup();

    render(<ListaNotificaciones notificaciones={[notificacion]} noLeidas={1} />);

    await user.click(screen.getByRole("button", { name: "Marcar como leída" }));

    await waitFor(() => expect(marcarLeidaMock).toHaveBeenCalledWith("n1"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("marca todas como leídas", async () => {
    const user = userEvent.setup();

    render(<ListaNotificaciones notificaciones={[notificacion]} noLeidas={1} />);

    await user.click(screen.getByRole("button", { name: "Marcar todas como leídas" }));

    await waitFor(() => expect(marcarTodasMock).toHaveBeenCalled());
    expect(refreshMock).toHaveBeenCalled();
  });

  it("oculta las acciones cuando no hay nada sin leer", () => {
    render(
      <ListaNotificaciones notificaciones={[{ ...notificacion, leida: true }]} noLeidas={0} />
    );

    expect(
      screen.queryByRole("button", { name: "Marcar todas como leídas" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Marcar como leída" })).not.toBeInTheDocument();
  });

  it("muestra el estado vacío", () => {
    render(<ListaNotificaciones notificaciones={[]} noLeidas={0} />);

    expect(screen.getByText("No hay notificaciones para mostrar.")).toBeInTheDocument();
  });
});
