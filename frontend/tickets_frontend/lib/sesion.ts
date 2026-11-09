import { z } from "zod";

import type { Sesion, UsuarioAutenticado } from "@/types/auth.types";

const SESSION_KEY = "tickets.session";
const SESSION_MAX_AGE = 60 * 60;

export const SESSION_COOKIE = SESSION_KEY;

const usuarioSchema: z.ZodType<UsuarioAutenticado> = z.object({
  id: z.string(),
  nombre: z.string(),
  correo_electronico: z.string(),
  rol: z.enum(["Administrador", "Soporte", "Usuario"]),
});

const sesionSchema: z.ZodType<Sesion> = z.object({
  token: z.string(),
  usuario: usuarioSchema,
});

const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined";

const tokenVencido = (token: string): boolean => {
  if (!isBrowser()) return false;

  const payload = token.split(".")[1];

  if (!payload) return false;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
    const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
    const { exp } = JSON.parse(atob(base64 + relleno)) as { exp?: unknown };

    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

export const parsearSesion = (raw: string | null): Sesion | null => {
  if (!raw) return null;

  try {
    const resultado = sesionSchema.safeParse(JSON.parse(raw));

    if (!resultado.success || tokenVencido(resultado.data.token)) return null;

    return resultado.data;
  } catch {
    return null;
  }
};

const notify = () => listeners.forEach(listener => listener());

export const obtenerSnapshotSesion = (): string | null =>
  isBrowser() ? window.localStorage.getItem(SESSION_KEY) : null;

export const obtenerSnapshotSesionServidor = (): string | null => null;

export const obtenerSesion = (): Sesion | null => parsearSesion(obtenerSnapshotSesion());

export const obtenerToken = (): string | null => obtenerSesion()?.token ?? null;

export const guardarSesion = (sesion: Sesion) => {
  const raw = JSON.stringify(sesion);

  window.localStorage.setItem(SESSION_KEY, raw);
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(raw)}; path=/; max-age=${SESSION_MAX_AGE}; samesite=lax`;
  notify();
};

export const limpiarSesion = () => {
  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
  notify();
};

export const suscribirSesion = (listener: () => void): (() => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};
