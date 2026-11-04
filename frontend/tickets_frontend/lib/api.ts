import { obtenerToken } from "@/lib/sesion";

const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(
  /\/$/,
  ""
);

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorMessage = (payload: unknown, status: number) => {
  if (isRecord(payload)) {
    if (typeof payload.error === "string") return payload.error;
    if (typeof payload.message === "string") return payload.message;
  }

  return `Error ${status}`;
};

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
  baseUrl?: string;
}

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { token = null, baseUrl = API_BASE_URL, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  const esFormData = rest.body instanceof FormData;

  if (!requestHeaders.has("Content-Type") && !esFormData) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  return payload as T;
};

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export const apiFetch = <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
  const { auth = true, ...rest } = options;

  return apiRequest<T>(path, { ...rest, token: auth ? obtenerToken() : null });
};
