import { beforeEach, describe, expect, it, vi } from "vitest";

import { guardarSesion } from "@/lib/sesion";
import { adjuntosService } from "@/services/adjuntos.service";

const fetchMock = vi.fn();

beforeEach(() => {
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("adjuntosService", () => {
  it("sube la imagen como FormData sin forzar JSON", async () => {
    guardarSesion({
      token: "token-123",
      usuario: {
        id: "11111111-1111-4111-8111-111111111111",
        nombre: "Cliente",
        correo_electronico: "usuario@example.com",
        rol: "Usuario",
      },
    });

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: "adjunto-1" } }),
    });

    const archivo = new File(["contenido"], "foto.png", { type: "image/png" });
    await adjuntosService.subir("ticket-1", archivo);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(url).toMatch(/\/tickets\/ticket-1\/adjuntos$/);
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(headers.has("Content-Type")).toBe(false);
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });
});
