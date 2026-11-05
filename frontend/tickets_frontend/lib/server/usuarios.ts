import type { Usuario } from "@/types/usuario.types";

import { fetchConSesion } from "./api";

export const obtenerUsuarios = async () =>
  (await fetchConSesion<{ data: Usuario[] }>("/users")).data;

export const obtenerSoportes = async () =>
  (await obtenerUsuarios()).filter(
    usuario => usuario.rol.nombre === "Soporte" && usuario.estado === "Activo"
  );
