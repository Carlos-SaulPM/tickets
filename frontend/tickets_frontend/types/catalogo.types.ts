export interface Area {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CrearAreaInput {
  nombre: string;
  activo?: boolean;
}

export interface ActualizarAreaInput {
  nombre?: string;
  activo?: boolean;
}

export interface CrearCategoriaInput {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface ActualizarCategoriaInput {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}
