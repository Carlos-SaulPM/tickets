import type { Area, Categoria } from "@/types/catalogo.types";

import { fetchConSesion } from "./api";

export const obtenerCategorias = async () =>
  (await fetchConSesion<{ data: Categoria[] }>("/categorias?activo=true")).data;

export const obtenerCategoriasTodas = async () =>
  (await fetchConSesion<{ data: Categoria[] }>("/categorias?activo=all")).data;

export const obtenerAreasActivas = async () =>
  (await fetchConSesion<{ data: Area[] }>("/areas?activo=true")).data;

export const obtenerAreasTodas = async () =>
  (await fetchConSesion<{ data: Area[] }>("/areas?activo=all")).data;
