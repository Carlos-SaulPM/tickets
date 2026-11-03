import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";
import { saveSession } from "@/lib/session";

const fetchMock = vi.fn();

const response = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("apiFetch", () => {
  it("envía el token Bearer cuando hay sesión", async () => {
    saveSession({
      token: "token-123",
      usuario: {
        id: "11111111-1111-4111-8111-111111111111",
        nombre: "Admin",
        correo_electronico: "admin@example.com",
        rol: "Administrador",
      },
    });
    fetchMock.mockResolvedValue(response(200, { data: [] }));

    await apiFetch("/users");

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("no envía token en login", async () => {
    saveSession({
      token: "token-123",
      usuario: {
        id: "11111111-1111-4111-8111-111111111111",
        nombre: "Admin",
        correo_electronico: "admin@example.com",
        rol: "Administrador",
      },
    });
    fetchMock.mockResolvedValue(response(200, { token: "nuevo" }));

    await apiFetch("/autenticacion/login", { method: "POST", auth: false });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(headers.get("Authorization")).toBeNull();
  });

  it("convierte respuesta error en ApiError", async () => {
    fetchMock.mockResolvedValue(response(403, { error: "Acceso denegado" }));

    await expect(apiFetch("/users")).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
      message: "Acceso denegado",
    });
  });

  it("lee también el campo message del backend", async () => {
    fetchMock.mockResolvedValue(response(400, { message: "Datos inválidos" }));

    await expect(apiFetch("/users")).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch("/users")).rejects.toMatchObject({
      message: "Datos inválidos",
    });
  });
});
