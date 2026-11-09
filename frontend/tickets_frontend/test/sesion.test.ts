import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  guardarSesion,
  limpiarSesion,
  obtenerSesion,
  obtenerToken,
  parsearSesion,
  suscribirSesion,
} from "@/lib/sesion";
import type { Sesion } from "@/types/auth.types";

const sesion: Sesion = {
  token: "token-de-prueba",
  usuario: {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Admin",
    correo_electronico: "admin@example.com",
    rol: "Administrador",
  },
};

const jwtConExpiracion = (exp: number) =>
  `cabecera.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.firma`;

beforeEach(() => {
  window.localStorage.clear();
  document.cookie = "tickets.session=; path=/; max-age=0";
});

describe("sesión", () => {
  it("guarda, lee y elimina la sesión", () => {
    guardarSesion(sesion);

    expect(obtenerSesion()).toEqual(sesion);
    expect(obtenerToken()).toBe(sesion.token);

    limpiarSesion();

    expect(obtenerSesion()).toBeNull();
    expect(obtenerToken()).toBeNull();
  });

  it("replica la sesión en una cookie para que el servidor la lea", () => {
    guardarSesion(sesion);

    expect(document.cookie).toContain("tickets.session=");
    expect(decodeURIComponent(document.cookie.split("=")[1] ?? "")).toContain(sesion.token);

    limpiarSesion();

    expect(document.cookie).not.toContain(sesion.token);
  });

  it("ignora JSON inválido", () => {
    window.localStorage.setItem("tickets.session", "{no-json");

    expect(parsearSesion(window.localStorage.getItem("tickets.session"))).toBeNull();
  });

  it("ignora roles desconocidos", () => {
    const raw = JSON.stringify({
      token: "token",
      usuario: { ...sesion.usuario, rol: "SuperAdmin" },
    });

    expect(parsearSesion(raw)).toBeNull();
  });

  it("ignora un JWT expirado", () => {
    const expirado = jwtConExpiracion(Math.floor(Date.now() / 1000) - 60);

    expect(parsearSesion(JSON.stringify({ ...sesion, token: expirado }))).toBeNull();
  });

  it("acepta un JWT vigente", () => {
    const vigente = jwtConExpiracion(Math.floor(Date.now() / 1000) + 3600);
    const conToken = { ...sesion, token: vigente };

    expect(parsearSesion(JSON.stringify(conToken))).toEqual(conToken);
  });

  it("acepta tokens que no son JWT", () => {
    const conToken = { ...sesion, token: "token-opaco" };

    expect(parsearSesion(JSON.stringify(conToken))).toEqual(conToken);
  });

  it("notifica cambios a los suscriptores", () => {
    const listener = vi.fn();
    const unsubscribe = suscribirSesion(listener);

    guardarSesion(sesion);
    limpiarSesion();

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});
