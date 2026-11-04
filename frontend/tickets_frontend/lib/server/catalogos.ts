import type { Area, Categoria } from "@/types/catalogo.types";

import { fetchConSesion } from "./api";

export const obtenerCategorias = async () =>
  (await fetchConSesion<{ data: Categoria[] }>("/categorias")).data;

export const obtenerAreasActivas = async () =>
  (await fetchConSesion<{ data: Area[] }>("/areas?activo=true")).data;
