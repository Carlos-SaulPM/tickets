import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccionesTicket } from "@/components/tickets/acciones-ticket";
import type { Ticket } from "@/types/ticket.types";

const { actualizarMock, cerrarMock, reabrirMock, refreshMock, replaceMock, logoutMock } =
  vi.hoisted(() => ({
    actualizarMock: vi.fn(),
    cerrarMock: vi.fn(),
    reabrirMock: vi.fn(),
    refreshMock: vi.fn(),
    replaceMock: vi.fn(),
    logoutMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, refresh: refreshMock }),
}));

vi.mock("@/services/tickets.service", () => ({
  ticketsService: { actualizar: actualizarMock, cerrar: cerrarMock, reabrir: reabrirMock },
}));

vi.mock("@/services/auth.service", () => ({
  authService: { logout: logoutMock },
}));

const ticket: Ticket = {
  id: "11111111-1111-4111-8111-111111111111",
  codigo: "#TK-001",
  asunto: "No enciende la computadora",
  descripcion: "La computadora no enciende desde ayer.",
  prioridad: "Media",
  estado: "Abierto",
  categoria: { id: "c1", nombre: "Hardware" },
  area: { id: "a1", nombre: "Sistemas" },
  usuario_creador: {
    id: "33333333-3333-4333-8333-333333333333",
    nombre: "Usuario",
    apellido_paterno: "Prueba",
    correo_electronico: "usuario@example.com",
  },
  asignado_a: null,
  creado_en: "2026-11-01T00:00:00.000Z",
  actualizado_en: "2026-11-01T00:00:00.000Z",
  fecha_cierre: null,
};

const propsBase = {
  ticket,
  puedeEditar: true,
  puedeCerrar: true,
  puedeReabrir: false,
  categorias: [
    { id: "c1", nombre: "Hardware", descripcion: null, activo: true },
    { id: "c2", nombre: "Software", descripcion: null, activo: true },
  ],
  areas: [{ id: "a1", nombre: "Sistemas", activo: true }],
};

beforeEach(() => {
  actualizarMock.mockReset();
  cerrarMock.mockReset();
  reabrirMock.mockReset();
  refreshMock.mockReset();
  replaceMock.mockReset();
  logoutMock.mockReset();
});

describe("AccionesTicket", () => {
  it("envía los campos editados al guardar", async () => {
    const user = userEvent.setup();
    actualizarMock.mockResolvedValue(ticket);

    render(<AccionesTicket {...propsBase} />);

    await user.click(screen.getByRole("button", { name: "Editar" }));

    const asunto = screen.getByLabelText("Asunto");
    await user.clear(asunto);
    await user.type(asunto, "Asunto corregido");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(actualizarMock).toHaveBeenCalledWith(ticket.id, {
        asunto: "Asunto corregido",
        prioridad: "Media",
        categoria_id: "c1",
        area_id: "a1",
      })
    );
    expect(refreshMock).toHaveBeenCalled();
  });

  it("no envía un asunto vacío", async () => {
    const user = userEvent.setup();

    render(<AccionesTicket {...propsBase} />);

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.clear(screen.getByLabelText("Asunto"));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(actualizarMock).not.toHaveBeenCalled();
  });

  it("cierra el ticket tras confirmar", async () => {
    const user = userEvent.setup();
    cerrarMock.mockResolvedValue(ticket);

    render(<AccionesTicket {...propsBase} />);

    await user.click(screen.getByRole("button", { name: "Cerrar ticket" }));
    await user.click(await screen.findByRole("button", { name: "Sí, cerrar" }));

    await waitFor(() => expect(cerrarMock).toHaveBeenCalledWith(ticket.id));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("reabre el ticket tras confirmar", async () => {
    const user = userEvent.setup();
    reabrirMock.mockResolvedValue(ticket);

    render(<AccionesTicket {...propsBase} puedeEditar={false} puedeCerrar={false} puedeReabrir />);

    await user.click(screen.getByRole("button", { name: "Reabrir ticket" }));
    await user.click(await screen.findByRole("button", { name: "Sí, reabrir" }));

    await waitFor(() => expect(reabrirMock).toHaveBeenCalledWith(ticket.id));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("no muestra acciones sin permisos", () => {
    render(
      <AccionesTicket {...propsBase} puedeEditar={false} puedeCerrar={false} puedeReabrir={false} />
    );

    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cerrar ticket" })).not.toBeInTheDocument();
  });
});
