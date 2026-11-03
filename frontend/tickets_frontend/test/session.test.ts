import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSession,
  getSession,
  getToken,
  parseSession,
  saveSession,
  subscribeSession,
} from "@/lib/session";
import type { Session } from "@/types/auth.types";

const session: Session = {
  token: "token-de-prueba",
  usuario: {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Admin",
    correo_electronico: "admin@example.com",
    rol: "Administrador",
  },
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("sesión", () => {
  it("guarda, lee y elimina la sesión", () => {
    saveSession(session);

    expect(getSession()).toEqual(session);
    expect(getToken()).toBe(session.token);

    clearSession();

    expect(getSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("ignora JSON inválido", () => {
    window.localStorage.setItem("tickets.session", "{no-json");

    expect(parseSession(window.localStorage.getItem("tickets.session"))).toBeNull();
  });

  it("ignora roles desconocidos", () => {
    const raw = JSON.stringify({
      token: "token",
      usuario: { ...session.usuario, rol: "SuperAdmin" },
    });

    expect(parseSession(raw)).toBeNull();
  });

  it("notifica cambios a los suscriptores", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    saveSession(session);
    clearSession();

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});
