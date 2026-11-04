import type { Usuario } from "@/types/usuario.types";

import { fetchConSesion } from "./api";

export const obtenerSoportes = async () =>
  (await fetchConSesion<{ data: Usuario[] }>("/users")).data.filter(
    usuario => usuario.rol.nombre === "Soporte" && usuario.estado === "Activo"
  );
