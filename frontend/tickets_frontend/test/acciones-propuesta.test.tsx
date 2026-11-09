import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccionesPropuesta } from "@/components/tickets/acciones-propuesta";
import { ApiError } from "@/lib/api";

const { aprobarMock, rechazarMock, refreshMock, replaceMock, logoutMock } = vi.hoisted(() => ({
  aprobarMock: vi.fn(),
  rechazarMock: vi.fn(),
  refreshMock: vi.fn(),
  replaceMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, refresh: refreshMock }),
}));

vi.mock("@/services/tickets.service", () => ({
  ticketsService: { aprobar: aprobarMock, rechazar: rechazarMock },
}));

vi.mock("@/services/auth.service", () => ({
  authService: { logout: logoutMock },
}));

const ticketId = "22222222-2222-4222-8222-222222222222";

beforeEach(() => {
  aprobarMock.mockReset();
  rechazarMock.mockReset();
  refreshMock.mockReset();
  replaceMock.mockReset();
  logoutMock.mockReset();
});

describe("AccionesPropuesta", () => {
  it("aprueba la solución tras confirmar en el diálogo", async () => {
    const user = userEvent.setup();
    aprobarMock.mockResolvedValue({});

    render(<AccionesPropuesta ticketId={ticketId} codigo="#TK-010" />);

    await user.click(screen.getByRole("button", { name: "Aprobar solución" }));

    expect(await screen.findByRole("heading", { name: "Aprobar solución" })).toBeInTheDocument();
    expect(screen.getByText(/Ticket #TK-010/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sí, aprobar" }));

    await waitFor(() => expect(aprobarMock).toHaveBeenCalledWith(ticketId));
    expect(refreshMock).toHaveBeenCalled();
    expect(rechazarMock).not.toHaveBeenCalled();
  });

  it("rechaza la solución tras confirmar en el diálogo", async () => {
    const user = userEvent.setup();
    rechazarMock.mockResolvedValue({});

    render(<AccionesPropuesta ticketId={ticketId} codigo="#TK-010" />);

    await user.click(screen.getByRole("button", { name: "Rechazar" }));
    await user.click(await screen.findByRole("button", { name: "Sí, rechazar" }));

    await waitFor(() => expect(rechazarMock).toHaveBeenCalledWith(ticketId));
    expect(aprobarMock).not.toHaveBeenCalled();
  });

  it("desloguea cuando la sesión expiró", async () => {
    const user = userEvent.setup();
    aprobarMock.mockRejectedValue(new ApiError("No autorizado", 401));

    render(<AccionesPropuesta ticketId={ticketId} codigo="#TK-010" />);

    await user.click(screen.getByRole("button", { name: "Aprobar solución" }));
    await user.click(await screen.findByRole("button", { name: "Sí, aprobar" }));

    await waitFor(() => expect(logoutMock).toHaveBeenCalled());
    expect(replaceMock).toHaveBeenCalledWith("/login?motivo=expirada");
  });
});
