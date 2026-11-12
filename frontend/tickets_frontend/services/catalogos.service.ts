import { apiFetch } from "@/lib/api";
import type {
  ActualizarAreaInput,
  ActualizarCategoriaInput,
  Area,
  Categoria,
  CrearAreaInput,
  CrearCategoriaInput,
} from "@/types/catalogo.types";

export const catalogosService = {
  crearArea: (data: CrearAreaInput) =>
    apiFetch<{ data: Area }>("/areas", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(respuesta => respuesta.data),

  actualizarArea: (id: string, data: ActualizarAreaInput) =>
    apiFetch<{ data: Area }>(`/areas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(respuesta => respuesta.data),

  eliminarArea: (id: string) => apiFetch(`/areas/${id}`, { method: "DELETE" }),

  crearCategoria: (data: CrearCategoriaInput) =>
    apiFetch<{ data: Categoria }>("/categorias", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(respuesta => respuesta.data),

  actualizarCategoria: (id: string, data: ActualizarCategoriaInput) =>
    apiFetch<{ data: Categoria }>(`/categorias/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(respuesta => respuesta.data),

  eliminarCategoria: (id: string) => apiFetch(`/categorias/${id}`, { method: "DELETE" }),
};
