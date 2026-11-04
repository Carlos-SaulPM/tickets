import { beforeEach, describe, expect, it, vi } from "vitest";

import { guardarSesion } from "@/lib/sesion";
import { ticketsService } from "@/services/tickets.service";

const fetchMock = vi.fn();

const respuesta = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

beforeEach(() => {
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("ticketsService", () => {
  it("aprueba la propuesta con POST al endpoint correcto", async () => {
    fetchMock.mockResolvedValue(respuesta({ data: { id: "t1" } }));

    await ticketsService.aprobar("t1");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toMatch(/\/tickets\/t1\/aprobar$/);
    expect(options.method).toBe("POST");
  });

  it("rechaza la propuesta con POST al endpoint correcto", async () => {
    fetchMock.mockResolvedValue(respuesta({ data: { id: "t1" } }));

    await ticketsService.rechazar("t1");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toMatch(/\/tickets\/t1\/rechazar$/);
    expect(options.method).toBe("POST");
  });

  it("asigna el ticket al soporte indicado", async () => {
    fetchMock.mockResolvedValue(respuesta({ data: { id: "t1" } }));

    await ticketsService.asignar("t1", "s1");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toMatch(/\/tickets\/t1\/asignar$/);
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ asignado_a_id: "s1" }));
  });

  it("adjunta el token de la sesión", async () => {
    guardarSesion({
      token: "token-123",
      usuario: {
        id: "11111111-1111-4111-8111-111111111111",
        nombre: "Cliente",
        correo_electronico: "usuario@example.com",
        rol: "Usuario",
      },
    });
    fetchMock.mockResolvedValue(respuesta({ data: { id: "t1" } }));

    await ticketsService.aprobar("t1");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });
});
