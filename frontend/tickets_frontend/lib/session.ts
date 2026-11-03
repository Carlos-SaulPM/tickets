import type { AuthUser, Session } from "@/types/auth.types";
import type { UserRole } from "@/types/user.types";

const SESSION_KEY = "tickets.session";

const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isUserRole = (value: unknown): value is UserRole =>
  value === "Administrador" || value === "Soporte" || value === "Usuario";

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.nombre === "string" &&
    typeof value.correo_electronico === "string" &&
    isUserRole(value.rol)
  );
};

export const parseSession = (raw: string | null): Session | null => {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || typeof parsed.token !== "string" || !isAuthUser(parsed.usuario)) {
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

export const getSessionSnapshot = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(SESSION_KEY);
};

export const getServerSessionSnapshot = (): string | null => null;

export const getSession = (): Session | null => parseSession(getSessionSnapshot());

export const getToken = (): string | null => getSession()?.token ?? null;

export const saveSession = (session: Session): void => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify();
};

export const clearSession = (): void => {
  window.localStorage.removeItem(SESSION_KEY);
  notify();
};

export const subscribeSession = (listener: () => void): (() => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};
