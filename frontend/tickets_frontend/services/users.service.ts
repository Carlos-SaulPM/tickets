import { apiFetch } from "@/lib/api";
import type {
  CreateUserInput,
  CreateUserResponse,
  UpdateUserInput,
  User,
} from "@/types/user.types";

const USERS_PATH = "/users";

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await apiFetch<{ data: User[] }>(USERS_PATH);
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiFetch<{ data: User }>(`${USERS_PATH}/${id}`);
    return response.data;
  },

  async create(data: CreateUserInput): Promise<CreateUserResponse> {
    const response = await apiFetch<{ data: CreateUserResponse }>(USERS_PATH, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  },

  async update(id: string, data: UpdateUserInput): Promise<void> {
    await apiFetch(`${USERS_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${USERS_PATH}/${id}`, {
      method: "DELETE",
    });
  },
};
