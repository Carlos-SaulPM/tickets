import { beforeEach, describe, expect, it, vi } from "vitest";

import { guardarSesion } from "@/lib/sesion";
import { notificacionesService } from "@/services/notificaciones.service";

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

  guardarSesion({
    token: "token-123",
    usuario: {
      id: "11111111-1111-4111-8111-111111111111",
      nombre: "Cliente",
      correo_electronico: "usuario@example.com",
      rol: "Usuario",
    },
  });
});

describe("notificacionesService", () => {
  it("lista con el límite indicado", async () => {
    fetchMock.mockResolvedValue(respuesta({ data: [], meta: { total: 0, no_leidas: 0 } }));

    await notificacionesService.listar({ limite: 5 });

    const [url] = fetchMock.mock.calls[0] as [string];

    expect(url).toMatch(/\/notificaciones\?limite=5$/);
  });

  it("pide solo las no leídas", async () => {
    fetchMock.mockResolvedValue(respuesta({ data: [], meta: { total: 0, no_leidas: 0 } }));

    await notificacionesService.listar({ limite: 20, noLeidas: true });

    const [url] = fetchMock.mock.calls[0] as [string];

    expect(url).toContain("no_leidas=true");
  });

  it("marca una notificación como leída", async () => {
    fetchMock.mockResolvedValue(respuesta({ message: "ok" }));

    await notificacionesService.marcarLeida("n1");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toMatch(/\/notificaciones\/n1\/leida$/);
    expect(options.method).toBe("PATCH");
  });

  it("marca todas como leídas", async () => {
    fetchMock.mockResolvedValue(respuesta({ data: { actualizadas: 2 } }));

    await notificacionesService.marcarTodas();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toMatch(/\/notificaciones\/leidas$/);
    expect(options.method).toBe("PATCH");
  });
});
