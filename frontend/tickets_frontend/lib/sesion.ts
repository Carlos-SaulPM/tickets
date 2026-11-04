import type { Sesion, UsuarioAutenticado } from "@/types/auth.types";
import type { RolUsuario } from "@/types/usuario.types";

const SESSION_KEY = "tickets.session";
const SESSION_MAX_AGE = 60 * 60;

const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRolUsuario = (value: unknown): value is RolUsuario =>
  value === "Administrador" || value === "Soporte" || value === "Usuario";

const isUsuarioAutenticado = (value: unknown): value is UsuarioAutenticado => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.nombre === "string" &&
    typeof value.correo_electronico === "string" &&
    isRolUsuario(value.rol)
  );
};

export const parsearSesion = (raw: string | null): Sesion | null => {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      !isRecord(parsed) ||
      typeof parsed.token !== "string" ||
      !isUsuarioAutenticado(parsed.usuario)
    ) {
      return null;
    }

    return { token: parsed.token, usuario: parsed.usuario };
  } catch {
    return null;
  }
};

const notify = () => {
  listeners.forEach(listener => listener());
};

export const obtenerSnapshotSesion = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(SESSION_KEY);
};

export const obtenerSnapshotSesionServidor = (): string | null => null;

export const obtenerSesion = (): Sesion | null => parsearSesion(obtenerSnapshotSesion());

export const obtenerToken = (): string | null => obtenerSesion()?.token ?? null;

export const SESSION_COOKIE = SESSION_KEY;

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
