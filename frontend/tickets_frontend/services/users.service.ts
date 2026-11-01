import { CreateUserInput, UpdateUserInput, User } from "@/types/user.types";

const API_BASE_URL = "http://localhost:3000/api/v1/users";

// Header estático simulado para rol de Administrador
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-user-role": "Admin",
});

export const usersService = {
  async getAll(): Promise<User[]> {
    const res = await fetch(API_BASE_URL, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener usuarios");
    return json.data;
  },

  async getById(id: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener el usuario");
    return json.data;
  },

  async create(data: CreateUserInput): Promise<void> {
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al crear el usuario");
  },

  async update(id: string, data: UpdateUserInput): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al actualizar el usuario");
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al eliminar el usuario");
  },
};
