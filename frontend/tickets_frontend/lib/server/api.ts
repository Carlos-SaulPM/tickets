import { redirect } from "next/navigation";

import { ApiError, apiRequest } from "@/lib/api";

import { requerirSesion } from "./sesion";

export const SERVER_API_BASE_URL = (
  process.env.API_URL_INTERNA ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1"
).replace(/\/$/, "");

export const fetchConSesion = async <T>(path: string): Promise<T> => {
  const sesion = await requerirSesion();

  try {
    return await apiRequest<T>(path, { token: sesion.token, baseUrl: SERVER_API_BASE_URL });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    throw error;
  }
};
