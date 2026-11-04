import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccionesAsignacion } from "@/components/tickets/acciones-asignacion";

const { asignarMock, refreshMock, replaceMock, logoutMock } = vi.hoisted(() => ({
  asignarMock: vi.fn(),
  refreshMock: vi.fn(),
  replaceMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, refresh: refreshMock }),
}));

vi.mock("@/services/tickets.service", () => ({
  ticketsService: { asignar: asignarMock },
}));

vi.mock("@/services/auth.service", () => ({
  authService: { logout: logoutMock },
}));

const soporte = {
  id: "22222222-2222-4222-8222-222222222222",
  nombre: "Ana",
  apellido_paterno: "Soporte",
  apellido_materno: "Prueba",
  correo_electronico: "ana@example.com",
  rol: { id: "r1", nombre: "Soporte" as const },
  estado: "Activo" as const,
  creado_en: "2026-11-01T00:00:00.000Z",
};

const propsBase = {
  ticketId: "11111111-1111-4111-8111-111111111111",
  codigo: "#TK-001",
  asignadoId: null,
  usuarioId: soporte.id,
  esAdmin: false,
  esSoporte: true,
  asignable: true,
  soportes: [],
};

beforeEach(() => {
  asignarMock.mockReset();
  refreshMock.mockReset();
  replaceMock.mockReset();
  logoutMock.mockReset();
});

describe("AccionesAsignacion", () => {
  it("permite al Soporte tomar el ticket tras confirmar", async () => {
    const user = userEvent.setup();
    asignarMock.mockResolvedValue({});

    render(<AccionesAsignacion {...propsBase} />);

    await user.click(screen.getByRole("button", { name: "Tomar ticket" }));
    await user.click(await screen.findByRole("button", { name: "Sí, tomar" }));

    await waitFor(() => expect(asignarMock).toHaveBeenCalledWith(propsBase.ticketId, soporte.id));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("muestra el selector y asigna al Administrador", async () => {
    const user = userEvent.setup();
    asignarMock.mockResolvedValue({});

    render(
      <AccionesAsignacion
        {...propsBase}
        esAdmin
        esSoporte={false}
        usuarioId="33333333-3333-4333-8333-333333333333"
        soportes={[soporte]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Asignar" }));

    await waitFor(() => expect(asignarMock).toHaveBeenCalledWith(propsBase.ticketId, soporte.id));
  });

  it("no muestra acciones al Usuario creador", () => {
    render(<AccionesAsignacion {...propsBase} esSoporte={false} soportes={[]} />);

    expect(screen.queryByRole("button", { name: "Tomar ticket" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Asignar" })).not.toBeInTheDocument();
  });

  it("indica cuando el Soporte ya atiende el ticket", () => {
    render(<AccionesAsignacion {...propsBase} asignadoId={soporte.id} />);

    expect(screen.getByText("Atiendes este ticket.")).toBeInTheDocument();
  });
});
