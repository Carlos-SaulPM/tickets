import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompositorMensajes } from "@/components/tickets/compositor-mensajes";

const { agregarMensajeMock, refreshMock, replaceMock, logoutMock } = vi.hoisted(() => ({
  agregarMensajeMock: vi.fn(),
  refreshMock: vi.fn(),
  replaceMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, refresh: refreshMock }),
}));

vi.mock("@/services/tickets.service", () => ({
  ticketsService: { agregarMensaje: agregarMensajeMock },
}));

vi.mock("@/services/auth.service", () => ({
  authService: { logout: logoutMock },
}));

vi.mock("@/components/tickets/editor-mensaje", () => ({
  EditorMensaje: ({ onChange }: { onChange: (html: string, vacio: boolean) => void }) => (
    <textarea
      aria-label="Mensaje"
      onChange={evento => onChange(evento.target.value, evento.target.value.trim() === "")}
    />
  ),
}));

const ID_UNO = "11111111-1111-4111-8111-111111111111";
const ID_DOS = "22222222-2222-4222-8222-222222222222";
const TICKET_ID = "33333333-3333-4333-8333-333333333333";

const escribir = (html: string) =>
  fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: html } });

const enviar = () => userEvent.setup().click(screen.getByRole("button", { name: "Enviar" }));

beforeEach(() => {
  agregarMensajeMock.mockReset();
  agregarMensajeMock.mockResolvedValue({});
  refreshMock.mockReset();
  replaceMock.mockReset();
  logoutMock.mockReset();
});

describe("CompositorMensajes", () => {
  it("envía los ids de las imágenes incrustadas", async () => {
    render(
      <CompositorMensajes ticketId={TICKET_ID} puedeProponer={false} puedeNotaInterna={false} />
    );

    escribir(
      `<p>Mira</p><img src="/api/adjuntos/${ID_UNO}" /><img src="/api/adjuntos/${ID_DOS}" />`
    );
    await enviar();

    await waitFor(() =>
      expect(agregarMensajeMock).toHaveBeenCalledWith(
        TICKET_ID,
        expect.objectContaining({ adjunto_ids: [ID_UNO, ID_DOS] })
      )
    );
  });

  it("no envía la imagen que el usuario borró del editor", async () => {
    render(
      <CompositorMensajes ticketId={TICKET_ID} puedeProponer={false} puedeNotaInterna={false} />
    );

    escribir(`<p>Mira</p><img src="/api/adjuntos/${ID_UNO}" />`);
    escribir("<p>Al final no adjunto nada</p>");
    await enviar();

    await waitFor(() =>
      expect(agregarMensajeMock).toHaveBeenCalledWith(
        TICKET_ID,
        expect.objectContaining({ adjunto_ids: [] })
      )
    );
  });

  it("limpia el editor después de enviar", async () => {
    render(
      <CompositorMensajes ticketId={TICKET_ID} puedeProponer={false} puedeNotaInterna={false} />
    );

    escribir("<p>Listo</p>");
    await enviar();

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.getByLabelText("Mensaje")).toHaveValue("");
  });

  it("marca la propuesta de solución cuando la casilla está activa", async () => {
    const user = userEvent.setup();

    render(<CompositorMensajes ticketId={TICKET_ID} puedeProponer puedeNotaInterna={false} />);

    escribir("<p>Propuesta</p>");
    await user.click(screen.getByLabelText("Proponer solución"));
    await enviar();

    await waitFor(() =>
      expect(agregarMensajeMock).toHaveBeenCalledWith(
        TICKET_ID,
        expect.objectContaining({ es_propuesta_solucion: true })
      )
    );
  });

  it("marca la nota interna cuando la casilla está activa", async () => {
    const user = userEvent.setup();

    render(<CompositorMensajes ticketId={TICKET_ID} puedeProponer={false} puedeNotaInterna />);

    escribir("<p>Nota para Soporte</p>");
    await user.click(screen.getByLabelText("Nota interna"));
    await enviar();

    await waitFor(() =>
      expect(agregarMensajeMock).toHaveBeenCalledWith(
        TICKET_ID,
        expect.objectContaining({ es_nota_interna: true })
      )
    );
  });

  it("no envía un mensaje vacío", async () => {
    render(
      <CompositorMensajes ticketId={TICKET_ID} puedeProponer={false} puedeNotaInterna={false} />
    );

    await enviar();

    expect(agregarMensajeMock).not.toHaveBeenCalled();
  });
});
