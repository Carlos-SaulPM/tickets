import type { Rol } from "@/types/rol.types";

import { fetchConSesion } from "./api";

export const obtenerRoles = async () => (await fetchConSesion<{ data: Rol[] }>("/roles")).data;
